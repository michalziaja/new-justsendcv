// popup.js
let userInfoDiv = null;

document.addEventListener("DOMContentLoaded", async () => {
  userInfoDiv = document.getElementById("user-info");

  const syncUrl = "https://4e7b-2a01-115f-4902-7900-489-ae8f-ed51-7751.ngrok-free.app/api/sync"; // Do aktualizacji

  try {
    // Pobierz token JWT z chrome.storage.local
    const { jwtToken } = await new Promise((resolve) => chrome.storage.local.get(["jwtToken"], resolve));
    console.log("Pobrany token JWT:", jwtToken);

    console.log("Próba połączenia z /api/sync:", syncUrl);
    const response = await fetch(syncUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(jwtToken && { "Authorization": `Bearer ${jwtToken}` }), // Dodaj token, jeśli istnieje
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Brak szczegółów błędu");
      throw new Error(`Błąd serwera: ${response.status} – ${errorText || "Brak odpowiedzi"}`);
    }

    const data = await response.json();
    console.log("Dane z /api/sync:", data);

    if (data.isLoggedIn) {
      const { email, firstName, lastName } = data.userData || {};
      let subscriptionHtml = "";

      if (data.subscription) {
        const {
          plan,
          status,
          cvCreatorLimit,
          cvCreatorUsed,
          currentOffers,
          totalOffers,
          startDate,
          endDate,
        } = data.subscription;

        subscriptionHtml = `
          <h2>Subskrypcja</h2>
          <p><strong>Plan:</strong> ${plan || "Brak"}</p>
          <p><strong>Status:</strong> ${status || "Brak"}</p>
          <p><strong>Limity CV:</strong> ${cvCreatorUsed || 0}/${cvCreatorLimit || "Brak"}</p>
          <p><strong>Oferty:</strong> ${currentOffers || 0}/${totalOffers || "Brak"}</p>
          <p><strong>Data startu:</strong> ${
            startDate ? new Date(startDate).toLocaleDateString() : "Brak"
          }</p>
          <p><strong>Data końca:</strong> ${
            endDate ? new Date(endDate).toLocaleDateString() : "Brak"
          }</p>
        `;
      } else {
        subscriptionHtml = `<p>Brak aktywnej subskrypcji.</p>`;
      }

      // Zapisz dane w chrome.storage.local
      if (data.token) {
        await chrome.storage.local.set({ jwtToken: data.token });
        console.log("Token JWT zapisany:", data.token);
      }
      await chrome.storage.local.set({ user: { email, firstName, lastName } });
      await chrome.storage.local.set({ subscription: data.subscription });
      console.log("Zapisane dane lokalne:", { user: { email, firstName, lastName }, subscription: data.subscription });

      displayUserInfo(email, firstName, lastName, subscriptionHtml, false);
    } else {
      displayUserInfo(
        null,
        null,
        null,
        `<p>Nie jesteś zalogowany. <a href="${syncUrl.replace('/api/sync', '/sign-in')}" target="_blank">Zaloguj się</a></p>`,
        false
      );
    }
  } catch (error) {
    console.error("Błąd podczas ładowania danych z /api/sync:", {
      message: error.message,
      stack: error.stack,
      url: syncUrl,
    });

    // Fallback na dane lokalne
    chrome.storage.local.get(["user", "subscription"], (result) => {
      const storedUser = result.user || {};
      const storedSubscription = result.subscription || {};
      let subscriptionHtml = "";

      if (storedSubscription.plan) {
        subscriptionHtml = `
          <h2>Subskrypcja (z pamięci podręcznej)</h2>
          <p><strong>Plan:</strong> ${storedSubscription.plan}</p>
          <p><strong>Status:</strong> ${storedSubscription.status || "Brak danych"}</p>
          <p><strong>Limity CV:</strong> ${storedSubscription.cvCreatorUsed || 0}/${storedSubscription.cvCreatorLimit || "Brak"}</p>
          <p><strong>Oferty:</strong> ${storedSubscription.currentOffers || 0}/${storedSubscription.totalOffers || "Brak"}</p>
          <p><strong>Data startu:</strong> ${
            storedSubscription.startDate ? new Date(storedSubscription.startDate).toLocaleDateString() : "Brak"
          }</p>
          <p><strong>Data końca:</strong> ${
            storedSubscription.endDate ? new Date(storedSubscription.endDate).toLocaleDateString() : "Brak"
          }</p>
        `;
      } else {
        subscriptionHtml = `<p>Brak danych subskrypcji w pamięci podręcznej.</p>`;
      }

      const errorMessage = error.message.includes("Błąd serwera")
        ? `Błąd połączenia: ${error.message}. <a href="${syncUrl.replace('/api/sync', '/sign-in')}" target="_blank">Zaloguj się</a>`
        : `Błąd: ${error.message}`;

      displayUserInfo(
        storedUser.email,
        storedUser.firstName,
        storedUser.lastName,
        `${subscriptionHtml}<p class="error">${errorMessage}</p>`,
        false
      );
    });
  }
});

// Funkcja do wyświetlania informacji użytkownika i subskrypcji
function displayUserInfo(email, firstName, lastName, subscriptionHtml, showLimitMessage) {
  if (userInfoDiv) {
    userInfoDiv.innerHTML = "";
    if (email || firstName || lastName) {
      userInfoDiv.innerHTML = `
        <p><strong>Email:</strong> ${email || "Brak"}</p>
        <p><strong>Imię:</strong> ${firstName || "Brak"}</p>
        <p><strong>Nazwisko:</strong> ${lastName || "Brak"}</p>
      `;
    }
    userInfoDiv.innerHTML += subscriptionHtml || "";

    // Styl dla błędu
    const style = document.createElement("style");
    style.textContent = `
      .error {
        color: #d32f2f;
        background-color: #ffebee;
        padding: 5px;
        border-radius: 4px;
        margin-top: 10px;
      }
    `;
    document.head.appendChild(style);
  } else {
    console.error("Element #user-info nie znaleziony w popupie!");
  }
}