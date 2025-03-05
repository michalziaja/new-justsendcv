// justjoinConfig.js
window.JUSTJOIN_CONFIG = {
    site: "justjoin.it",
    selectors: {
      applyButton: '[name="floating_apply_button"]', // Przycisk "Apply"
      position: 'h1[class^="css-"]', // Stanowisko w <h1> (do zweryfikowania)
      company: 'h2[class^="css-"]', // Firma w <h2> (do zweryfikowania)
      container: '.css-1gih5vw', // Kontener przycisku "Apply"
      descriptionSections: '.css-1fylnvr', // Kontener opisu (do zweryfikowania)
    },
    getJobInfo: (url) => {
      const jobInfo = {
        site: "justjoin.it",
        position: "",
        company: "",
        url: url,
        description: "",
      };
  
      // Pobieranie stanowiska
      const positionElement = document.querySelector('h1[class^="css-"]');
      if (positionElement) {
        jobInfo.position = positionElement.textContent.trim();
      } else {
        console.warn("Nie znaleziono stanowiska z selektorem h1[class^=\"css-\"]! Próbuję fallback...");
        const titleContent = document.querySelector("title")?.textContent.trim() || "";
        const titleParts = titleContent.split(" - ");
        if (titleParts && titleParts.length > 0) {
          jobInfo.position = titleParts[0].trim();
        }
      }
  
      // Pobieranie firmy
      const companyElement = document.querySelector('h2[class^="css-"]');
      if (companyElement) {
        jobInfo.company = companyElement.textContent.trim();
      } else {
        console.warn("Nie znaleziono firmy z selektorem h2[class^=\"css-\"]! Próbuję fallback...");
        const titleContent = document.querySelector("title")?.textContent.trim() || "";
        const titleParts = titleContent.split(" - ");
        if (titleParts && titleParts.length > 1) {
          jobInfo.company = titleParts[1].replace(" | Just Join IT", "").trim();
        }
      }
  
      // Pobieranie opisu
      const descriptionContainer = document.querySelector('.css-1fylnvr');
      if (descriptionContainer) {
        const startElement = descriptionContainer.querySelector('h3');
        if (startElement && startElement.textContent.trim() === 'Opis stanowiska') {
          let descriptionText = '';
          const elements = descriptionContainer.querySelectorAll('h3, p, ul, ol');
          let started = false;
          elements.forEach((element) => {
            if (element === startElement) {
              started = true;
            } else if (started && element.textContent.trim()) {
              descriptionText += '\n' + element.textContent.trim();
            }
          });
          jobInfo.description = descriptionText.trim();
        } else {
          console.warn("Nie znaleziono <h3> 'Opis stanowiska' w kontenerze .css-1fylnvr! Dostępne h3:");
          const h3Elements = Array.from(descriptionContainer.querySelectorAll('h3')).map(h => ({
            text: h.textContent.trim(),
            parentClass: h.parentElement.className,
          }));
          console.log(h3Elements);
        }
  
        if (!jobInfo.description) {
          console.warn("Znaleziono kontener .css-1fylnvr, ale brak treści opisu! Zawartość:", descriptionContainer.textContent.trim().substring(0, 100) + '...');
        }
      } else {
        console.warn("Nie znaleziono kontenera opisu z selektorem .css-1fylnvr! Dostępne elementy:");
        const debugElements = Array.from(document.querySelectorAll('.MuiBox-root, [class^="css-"]')).map(e => ({
          class: e.className,
          textPreview: e.textContent.trim().substring(0, 50) + '...',
        }));
        console.log(debugElements);
      }
  
      console.log("Pobrano dane oferty z justjoin.it:", jobInfo);
      return jobInfo;
    },
    getApplyButtonStyle: (applyButton) => {
      if (!applyButton) {
        console.info("Przycisk 'Apply' nie znaleziony na justjoin.it – używanie domyślnych stylów.");
        return {
          width: "200px",
          height: "48px",
          padding: "10px 20px",
          borderRadius: "8px",
          fontSize: "16px",
          lineHeight: "normal",
        };
      }
      const computedStyle = window.getComputedStyle(applyButton);
      return {
        width: computedStyle.width,
        height: computedStyle.height,
        padding: computedStyle.padding,
        borderRadius: computedStyle.borderRadius,
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
      };
    },
    buttonStyles: {
      height: "48px",
      marginLeft: "5px", // Dodajemy 5px odstępu od przycisku "Apply"
      borderRadius: "8px",
      width: "200px",
    },
    buttonInsertionMethod: "insertAfterApply",
    containerStyles: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      gap: "5px", // Alternatywnie: odstęp między elementami w kontenerze
    },
  };