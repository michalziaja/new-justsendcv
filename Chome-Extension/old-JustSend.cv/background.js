// Funkcja do odświeżania tokenu
async function refreshToken() {
    try {
        const result = await chrome.storage.local.get(['supabase_refresh_token']);
        const refreshToken = result.supabase_refresh_token;
        
        if (!refreshToken) {
            throw new Error('Brak tokenu odświeżającego');
        }
        
        const response = await fetch('http://localhost:3000/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (!response.ok) {
            throw new Error('Nie udało się odświeżyć tokena');
        }

        const data = await response.json();
        
        // Zapisz nowe tokeny
        await chrome.storage.local.set({
            supabase_access_token: data.access_token,
            supabase_refresh_token: data.refresh_token
        });
        
        // Powiadom wszystkie komponenty o aktualizacji tokenu
        try {
            chrome.runtime.sendMessage({
                action: 'tokenUpdated',
                token: data.access_token
            }).catch(() => {
                // Ignoruj błąd jeśli nie ma odbiorcy
                console.log('Nie znaleziono odbiorcy dla wiadomości tokenUpdated');
            });
        } catch (error) {
            console.log('Błąd podczas wysyłania wiadomości:', error);
        }

        return { success: true, token: data.access_token };
    } catch (error) {
        console.error('Błąd podczas odświeżania tokena:', error);
        return { success: false, error: error.message };
    }
}

// Funkcja do sprawdzania czy token wymaga odświeżenia
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        return (expirationTime - currentTime) < 5 * 60 * 1000;
    } catch (e) {
        return true;
    }
}

// Funkcja do automatycznego odświeżania tokenu
async function checkAndRefreshToken() {
    const result = await chrome.storage.local.get(['supabase_access_token']);
    const accessToken = result.supabase_access_token;
    if (accessToken && isTokenExpired(accessToken)) {
        await refreshToken();
    }
}

// Sprawdzaj token co 4 minuty
const TOKEN_CHECK_INTERVAL = 4 * 60 * 1000;
setInterval(checkAndRefreshToken, TOKEN_CHECK_INTERVAL);

// Nasłuchuj na wiadomości
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshToken') {
        refreshToken()
            .then(result => {
                sendResponse(result);
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Informuje Chrome, że odpowiedź będzie asynchroniczna
    }

    if (request.action === 'getToken') {
        chrome.storage.local.get(['supabase_access_token'], (result) => {
            sendResponse({ token: result.supabase_access_token || null });
        });
        return true; // Informuje Chrome, że odpowiedź będzie asynchroniczna
    }
    
    if (request.action === 'setTokens') {
        chrome.storage.local.set({
            supabase_access_token: request.tokens.access_token,
            supabase_refresh_token: request.tokens.refresh_token
        }, () => {
            // Powiadom o zmianie tokenu
            try {
                chrome.runtime.sendMessage({
                    action: 'tokenUpdated',
                    token: request.tokens.access_token
                }).catch(() => {
                    // Ignoruj błąd jeśli nie ma odbiorcy
                    console.log('Nie znaleziono odbiorcy dla wiadomości tokenUpdated');
                });
            } catch (error) {
                console.log('Błąd podczas wysyłania wiadomości:', error);
            }
            sendResponse({ success: true });
        });
        return true; // Informuje Chrome, że odpowiedź będzie asynchroniczna
    }

    if (request.action === 'refreshSavedPage') {
        // Znajdź wszystkie otwarte karty z /saved
        chrome.tabs.query({ url: request.targetUrl + '*' }, (tabs) => {
            // Odśwież każdą znalezioną kartę
            tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });
        });
    }
});

// Nasłuchuj na zmiany w storage w aplikacji webowej
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url?.startsWith('http://localhost:3000') && changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId },
            function: () => {
                // Sprawdź różne możliwe formaty tokenu
                const possibleTokenKeys = [
                    'supabase.auth.token',
                    'sb-access-token',
                    'supabase_access_token'
                ];

                for (const key of possibleTokenKeys) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        try {
                            let accessToken, refreshToken;
                            
                            if (key === 'supabase.auth.token') {
                                const tokenData = JSON.parse(value);
                                if (tokenData.currentSession) {
                                    accessToken = tokenData.currentSession.access_token;
                                    refreshToken = tokenData.currentSession.refresh_token;
                                }
                            } else if (key === 'sb-access-token') {
                                accessToken = value;
                                refreshToken = localStorage.getItem('sb-refresh-token');
                            } else {
                                accessToken = value;
                                refreshToken = localStorage.getItem('supabase_refresh_token');
                            }

                            if (accessToken && refreshToken) {
                                try {
                                    chrome.runtime.sendMessage({
                                        action: 'setTokens',
                                        tokens: {
                                            access_token: accessToken,
                                            refresh_token: refreshToken
                                        }
                                    }).catch(() => {
                                        // Ignoruj błąd jeśli nie ma odbiorcy
                                        console.log('Nie znaleziono odbiorcy dla wiadomości setTokens');
                                    });
                                } catch (error) {
                                    console.log('Błąd podczas wysyłania wiadomości:', error);
                                }
                            }
                        } catch (e) {
                            console.error(`Błąd parsowania tokenu z ${key}:`, e);
                        }
                    }
                }
            }
        });
    }
});
