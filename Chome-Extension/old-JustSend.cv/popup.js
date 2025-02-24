document.addEventListener('DOMContentLoaded', () => {
    const statusContainer = document.getElementById('statusContainer');
    const actionButton = document.getElementById('actionButton');
    const userContainer = document.getElementById('userContainer');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');

    function updateUI(isConnected, userData = null) {
        if (isConnected && userData) {
            statusContainer.textContent = 'Połączono z aplikacją';
            statusContainer.className = 'status connected';
            actionButton.textContent = 'Przejdź do aplikacji';
            
            // Wyświetl informacje o użytkowniku
            userContainer.style.display = 'block';
            userName.textContent = userData.name || 'Użytkownik';
            userEmail.textContent = userData.email || '';
            if (userData.name) {
                userAvatar.textContent = userData.name.split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
            }
        } else {
            statusContainer.textContent = 'Nie połączono z aplikacją';
            statusContainer.className = 'status disconnected';
            actionButton.textContent = 'Zaloguj się';
            userContainer.style.display = 'none';
        }
    }

    async function checkConnection() {
        try {
            // Pobierz token z chrome.storage.local
            const result = await chrome.storage.local.get(['supabase_access_token']);
            const token = result.supabase_access_token;
            
            if (token) {
                // Pobierz dane użytkownika z API
                const response = await fetch('http://localhost:3000/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    updateUI(true, userData);
                } else {
                    // Jeśli token jest nieważny, spróbuj go odświeżyć
                    const refreshResult = await chrome.runtime.sendMessage({ action: 'refreshToken' });
                    if (refreshResult && refreshResult.success) {
                        // Spróbuj ponownie z nowym tokenem
                        checkConnection();
                    } else {
                        throw new Error('Nie udało się pobrać danych użytkownika');
                    }
                }
            } else {
                updateUI(false);
            }
        } catch (error) {
            console.error('Błąd:', error);
            updateUI(false);
        }
    }

    actionButton.addEventListener('click', () => {
        const isConnected = statusContainer.className.includes('connected');
        const url = isConnected ? 'http://localhost:3000/home' : 'http://localhost:3000/auth';
        chrome.tabs.create({ url });
    });

    // Nasłuchuj na zmiany w autoryzacji
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'authStateChanged' || message.action === 'tokenUpdated') {
            checkConnection();
        }
    });

    // Sprawdź połączenie przy otwarciu popup
    checkConnection();
});
