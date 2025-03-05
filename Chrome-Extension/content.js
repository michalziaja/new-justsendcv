const BUTTON_COLORS = {
  normal: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
  hover: 'linear-gradient(90deg, #0891b2 0%, #2563eb 100%)',
  saved: 'linear-gradient(90deg, #a686f1 0%, #7dddec 100%)',
};

function createSaveButton(styles, config) {
  const saveButton = document.createElement("a");
  saveButton.id = "saveButton";
  saveButton.textContent = "+ JustSend.cv";
  saveButton.style.background = BUTTON_COLORS.normal;
  saveButton.style.color = "white";
  saveButton.style.textDecoration = "none";
  saveButton.style.display = "flex";
  saveButton.style.alignItems = "center";
  saveButton.style.justifyContent = "center";
  saveButton.style.width = styles.width || "100%";
  saveButton.style.padding = styles.padding || "10px 20px";
  saveButton.style.borderRadius = styles.borderRadius || config.buttonStyles.borderRadius || "0px";
  saveButton.style.fontSize = styles.fontSize || "16px";
  saveButton.style.lineHeight = styles.lineHeight || "normal";
  saveButton.style.height = config.buttonStyles.height || "auto";
  saveButton.style.marginTop = config.buttonStyles.marginTop || "0px";

  saveButton.addEventListener("mouseover", () => {
    saveButton.style.background = BUTTON_COLORS.hover;
  });
  saveButton.addEventListener("mouseout", () => {
    saveButton.style.background = BUTTON_COLORS.normal;
  });
  saveButton.addEventListener("click", saveJobOffer);

  console.log("Przycisk utworzony – aktywny.");
  return saveButton;
}

function disableSaveButton() {
  const saveButton = document.getElementById("saveButton");
  if (saveButton) {
    saveButton.textContent = "Zapisano";
    saveButton.style.background = BUTTON_COLORS.saved; // Używamy koloru saved zamiast szarego
    saveButton.style.cursor = "default";
    saveButton.style.pointerEvents = "none";
    saveButton.removeEventListener("click", saveJobOffer);
    saveButton.removeEventListener("mouseover", () => {});
    saveButton.removeEventListener("mouseout", () => {});
    console.log("Przycisk wyłączony.");
  }
}

function saveJobOffer(event) {
  event.preventDefault();
  const currentUrl = window.location.href;
  const siteConfig = getSiteConfig();

  if (!siteConfig) {
    console.error("Brak konfiguracji dla tej strony!");
    alert("Błąd: Nie znaleziono konfiguracji dla tej strony.");
    return;
  }

  // Sprawdź, czy oferta nie jest już zapisana w chrome.storage.local
  chrome.storage.local.get(["savedOffers"], (result) => {
    const savedOffers = result.savedOffers || [];
    if (savedOffers.some(offer => offer.url === currentUrl)) {
      console.log("Oferta już zapisana lokalnie – dezaktywacja przycisku.");
      disableSaveButton();
      return;
    }

    // Pobierz token JWT z chrome.storage.local
    chrome.storage.local.get(["jwtToken"], (tokenResult) => {
      const token = tokenResult.jwtToken;
      if (!token) {
        console.error("Brak tokenu JWT w chrome.storage.local!");
        alert("Błąd: Nie jesteś zalogowany – zaloguj się ponownie w popupie.");
        return;
      }

      // Pobierz dane oferty
      const jobInfo = siteConfig.getJobInfo(currentUrl);
      console.log("Zbierane dane oferty:", jobInfo);

      // Wyślij dane do background.js
      chrome.runtime.sendMessage({
        action: "saveOffer",
        data: jobInfo,
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Błąd komunikacji z background.js:", chrome.runtime.lastError);
          alert("Błąd: Nie można połączyć się z wtyczką.");
          return;
        }
        if (response && response.success) {
          // Zaktualizuj zapisane oferty w chrome.storage.local
          const newOffer = { url: currentUrl, id: response.offer_id };
          const updatedOffers = [...savedOffers, newOffer];
          chrome.storage.local.set({ savedOffers: updatedOffers }, () => {
            console.log("Oferta zapisana lokalnie:", newOffer);
          });
          disableSaveButton();
          console.log("Oferta zapisana pomyślnie w Supabase.");
        } else if (response && response.error) {
          // Przy błędzie limitu otwórz popup (zamiast alertu)
          chrome.runtime.sendMessage({
            action: "showLimitPopup",
            error: response.error,
            currentUrl: window.location.href, // Opcjonalnie, aby popup mógł pokazać szczegóły
          });
          console.error("Błąd podczas zapisu oferty:", response.error);
        }
      });
    });
  });
}

/*
function saveJobOffer(event) {
  event.preventDefault();
  const currentUrl = window.location.href;
  const siteConfig = getSiteConfig();

  if (!siteConfig) {
    console.error("Brak konfiguracji dla tej strony!");
    return;
  }

  // Opóźnienie, aby upewnić się, że treść jest załadowana
  setTimeout(() => {
    const jobInfo = siteConfig.getJobInfo(currentUrl);
    console.log("Zbierane dane oferty:", jobInfo);
    console.log("Symulacja zapisu oferty...");
    disableSaveButton();
  }, 1000); // 1 sekunda opóźnienia
}
*/

function injectSaveButton(config) {
  if (!config) {
    console.error("Brak konfiguracji w injectSaveButton!");
    return;
  }

  const applyButton = document.querySelector(config.selectors.applyButton);
  const container = document.querySelector(config.selectors.container);

  // Sprawdź, czy przycisk już istnieje w kontenerze, w całym DOM, lub czy został wstrzyknięty
  if (!container?.querySelector("#saveButton") && !document.querySelector("#saveButton")) {
    if (!container) {
      console.log("Kontener nie znaleziony.");
      return;
    }

    if (config.containerStyles) {
      Object.assign(container.style, config.containerStyles);
    }

    // Pobierz style przycisku Apply
    const applyStyles = config.getApplyButtonStyle(applyButton);
    
    // Sprawdź, czy oferta jest już zapisana lokalnie przed wstrzyknięciem
    const currentUrl = window.location.href;
    chrome.storage.local.get(["savedOffers"], (result) => {
      const savedOffers = result.savedOffers || [];
      const isAlreadySaved = savedOffers.some(offer => offer.url === currentUrl);
      
      // Utwórz przycisk niezależnie od tego, czy oferta jest zapisana
      const saveButton = createSaveButton(applyStyles, config);
      
      // Jeśli oferta jest już zapisana, wyłącz przycisk natychmiast
      if (isAlreadySaved) {
        console.log("Oferta już zapisana lokalnie – dezaktywacja przycisku.");
        // Zmień wygląd przycisku na nieaktywny
        saveButton.textContent = "Zapisano";
        saveButton.style.background = BUTTON_COLORS.saved; // Używamy koloru saved
        saveButton.style.cursor = "default";
        saveButton.style.pointerEvents = "none";
        // Nie dodajemy event listenerów
      }

      // Dodaj flagę, aby śledzić, czy przycisk został wstrzyknięty
      let buttonInjected = false;
      const checkAndInject = () => {
        if (!buttonInjected && !container.querySelector("#saveButton") && !document.querySelector("#saveButton")) {
          const insertionMethod = config.buttonInsertionMethod || "appendToContainer";
          switch (insertionMethod) {
            case "appendToContainer":
              container.appendChild(saveButton);
              console.log("Przycisk dodany do kontenera (appendToContainer).");
              break;
            case "insertAfterApply":
              if (applyButton && applyButton.parentNode) {
                applyButton.parentNode.insertBefore(saveButton, applyButton.nextSibling);
                console.log("Przycisk wstawiony po 'Aplikuj' (insertAfterApply).");
              } else {
                console.warn("Przycisk 'Aplikuj' nie znaleziony – fallback na appendToContainer.");
                container.appendChild(saveButton);
              }
              break;
            case "insertBeforeApply":
              if (applyButton && applyButton.parentNode) {
                applyButton.parentNode.insertBefore(saveButton, applyButton);
                console.log("Przycisk wstawiony przed 'Aplikuj' (insertBeforeApply).");
              } else {
                console.warn("Przycisk 'Aplikuj' nie znaleziony – fallback na appendToContainer.");
                container.appendChild(saveButton);
              }
              break;
            default:
              console.warn("Nieznana metoda wstawiania – domyślnie appendToContainer.");
              container.appendChild(saveButton);
              break;
          }
          buttonInjected = true;
        } else {
          console.log("Przycisk już istnieje lub został wstrzyknięty – pomijanie wstrzyknięcia.");
        }
      };

      // Wykonaj wstrzyknięcie z opóźnieniem, aby upewnić się, że DOM jest stabilny
      setTimeout(checkAndInject, 50); // Opóźnienie 100ms
    });
  // } else {
  //   console.log("Przycisk już istnieje lub został wstrzyknięty – pomijanie wstrzyknięcia.");
  }}

function getSiteConfig() {
  const hostname = window.location.hostname;
  if (hostname.includes("pracuj.pl")) return window.PRACUJ_CONFIG;
  if (hostname.includes("rocketjobs.pl")) return window.ROCKETJOBS_CONFIG;
  if (hostname.includes("justjoin.it")) return window.JUSTJOIN_CONFIG;
  if (hostname.includes("gowork.pl")) return window.GOWORK_CONFIG;
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  const config = getSiteConfig();
  if (config) {
    injectSaveButton(config);
  } else {
    console.error("Brak konfiguracji dla tej domeny!");
  }
});

const observer = new MutationObserver((mutations) => {
  const config = getSiteConfig();
  if (config) {
    const container = document.querySelector(config.selectors.container);
    if (container) {
      mutations.forEach(() => {
        injectSaveButton(config);
      });
    } else {
      console.log("Kontener nie znaleziony w MutationObserver.");
    }
  } else {
    console.error("Brak konfiguracji w MutationObserver!");
  }
});
observer.observe(document.body, { childList: true, subtree: true });