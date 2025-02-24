// Funkcja do odświeżania tokena
async function refreshToken() {
    try {
      const refreshToken = localStorage.getItem('supabase_refresh_token');
      
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
      localStorage.setItem('supabase_access_token', data.access_token);
      localStorage.setItem('supabase_refresh_token', data.refresh_token);
      
      // Powiadom background script o nowym tokenie
      chrome.runtime.sendMessage({ 
        action: 'tokenRefreshed', 
        tokens: { 
          access_token: data.access_token, 
          refresh_token: data.refresh_token 
        }
      });
      
      return data.access_token;
    } catch (error) {
      console.error('Błąd podczas odświeżania tokena:', error);
      // Wyloguj użytkownika w przypadku błędu
      logout();
      throw error;
    }
}

// Funkcja do wykonywania zapytań z automatycznym odświeżaniem tokena
async function authenticatedFetch(url, options = {}) {
    try {
      // Dodaj token do nagłówka
      const accessToken = localStorage.getItem('supabase_access_token');
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      };
  
      let response = await fetch(url, options);
  
      // Jeśli token wygasł (401), spróbuj go odświeżyć
      if (response.status === 401) {
        const newToken = await refreshToken();
        
        // Powtórz zapytanie z nowym tokenem
        options.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, options);
      }
  
      return response;
    } catch (error) {
      console.error('Błąd podczas wykonywania zapytania:', error);
      throw error;
    }
}

// Funkcja do sprawdzania czy token wymaga odświeżenia
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // konwersja na milisekundy
        const currentTime = Date.now();
        // Odśwież token jeśli zostało mniej niż 5 minut
        return (expirationTime - currentTime) < 5 * 60 * 1000;
    } catch (e) {
        return true;
    }
}

// Funkcja do automatycznego odświeżania tokena
async function checkAndRefreshToken() {
    const accessToken = localStorage.getItem('supabase_access_token');
    if (accessToken && isTokenExpired(accessToken)) {
        await refreshToken();
    }
}