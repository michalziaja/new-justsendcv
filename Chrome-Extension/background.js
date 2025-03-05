// background.js

// Nasłuchiwanie wiadomości od content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveOffer") {
    const { data: jobInfo } = message; // Dane oferty (site, position, company, url, description)

    // Pobierz token JWT z chrome.storage.local
    chrome.storage.local.get(["jwtToken"], async (result) => {
      const token = result.jwtToken;
      if (!token) {
        console.error("Brak tokenu JWT w chrome.storage.local!");
        sendResponse({ success: false, error: "Brak autoryzacji – zaloguj się ponownie." });
        return;
      }

      try {
        // Wysyłka do Supabase (POST /saved-offer)
        const response = await fetch("https://qnndkrwmxbvicznvfjsk.supabase.co/functions/v1/saved-offer", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jobInfo),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Błąd HTTP:", response.status, errorText);
          sendResponse({ success: false, error: `Błąd serwera: ${response.status} – ${errorText}` });
          return;
        }

        const result = await response.json();

        if (result.success) {
          // Walidacja odpowiedzi
          if (!result.offer_id || !result.subscription) {
            console.error("Nieprawidłowa odpowiedź serwera:", result);
            sendResponse({ success: false, error: "Nieprawidłowa odpowiedź serwera" });
            return;
          }

          // Zaktualizuj subskrypcję w chrome.storage.local
          await chrome.storage.local.set({ subscription: result.subscription });
          console.log("Subskrypcja zaktualizowana w chrome.storage.local:", result.subscription);

          // Obsługa powiadomień
          if (result.notifications && result.notifications.length > 0) {
            chrome.storage.local.get(["notifications_sent"], async (storageResult) => {
              let notificationsSent = storageResult.notifications_sent || { total_80: false, total_100: false };

              for (const notification of result.notifications) {
                let shouldDisplay = true;

                // Sprawdzanie jednorazowości dla total_offers
                if (notification.type === "limit_warning_total" && notificationsSent.total_80) {
                  shouldDisplay = false;
                } else if (notification.type === "limit_reached_total" && notificationsSent.total_100) {
                  shouldDisplay = false;
                }

                if (shouldDisplay) {
                  // Wyświetl powiadomienie Chrome
                  chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon48.png", // Zakładam, że ikona będzie dostępna
                    title: "JustSend.cv – Limit Ofert",
                    message: notification.message,
                    buttons: [{ title: "Przejdź na Premium" }],
                  }, (notificationId) => {
                    if (chrome.runtime.lastError) {
                      console.error("Błąd tworzenia powiadomienia:", chrome.runtime.lastError);
                    } else {
                      console.log("Powiadomienie wyświetlone:", notificationId);
                    }
                  });

                  // Aktualizuj flagi jednorazowości
                  if (notification.type === "limit_warning_total") {
                    notificationsSent.total_80 = true;
                  } else if (notification.type === "limit_reached_total") {
                    notificationsSent.total_100 = true;
                  }
                }
              }

              // Zapisz zaktualizowane flagi
              await chrome.storage.local.set({ notifications_sent: notificationsSent });
            });
          }

          // Wyślij sukces do content.js
          sendResponse({ success: true, offer_id: result.offer_id });
          console.log("Oferta zapisana pomyślnie:", jobInfo);
        } else {
          // Obsługa błędu (np. limit osiągnięty)
          if (!result.error || !result.subscription) {
            console.error("Nieprawidłowa odpowiedź błędu:", result);
            sendResponse({ success: false, error: "Nieprawidłowa odpowiedź serwera" });
            return;
          }

          // Zaktualizuj subskrypcję w chrome.storage.local
          await chrome.storage.local.set({ subscription: result.subscription });

          // Obsługa powiadomień przy błędzie
          if (result.notifications && result.notifications.length > 0) {
            chrome.storage.local.get(["notifications_sent"], async (storageResult) => {
              let notificationsSent = storageResult.notifications_sent || { total_80: false, total_100: false };

              for (const notification of result.notifications) {
                let shouldDisplay = true;

                if (notification.type === "limit_reached_total" && notificationsSent.total_100) {
                  shouldDisplay = false;
                }

                if (shouldDisplay) {
                  chrome.notifications.create({
                    type: "basic",
                    iconUrl: "icon48.png",
                    title: "JustSend.cv – Limit Ofert",
                    message: notification.message,
                    buttons: [{ title: "Przejdź na Premium" }],
                  }, (notificationId) => {
                    if (chrome.runtime.lastError) {
                      console.error("Błąd tworzenia powiadomienia:", chrome.runtime.lastError);
                    }
                  });

                  if (notification.type === "limit_reached_total") {
                    notificationsSent.total_100 = true;
                  }
                }
              }

              await chrome.storage.local.set({ notifications_sent: notificationsSent });
            });
          }

          sendResponse({ success: false, error: result.error });
          console.warn("Błąd zapisu oferty:", result.error);
        }
      } catch (error) {
        console.error("Błąd podczas zapisu oferty:", error.message || error);
        sendResponse({ success: false, error: `Błąd sieci lub serwera: ${error.message || error}` });
      }
    });

    // Zwracanie true dla asynchronicznej odpowiedzi
    return true;
  }
});

// Obsługa kliknięcia w przycisk powiadomienia
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // "Przejdź na Premium"
    chrome.tabs.create({ url: "https://justsend.cv/premium" }); // Zastąp docelowym URL-em
    chrome.notifications.clear(notificationId);
  }
});