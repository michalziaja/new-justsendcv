// rocketjobsConfig.js
window.ROCKETJOBS_CONFIG = {
    site: "rocketjobs.pl",
    selectors: {
      applyButton: '.css-oyi7y5', // Przycisk "Aplikuj na ofertę pracy"
      position: 'h1[class^="css-"]', // Stanowisko w <h1>
      container: '[name="floating_apply_button"]', // Kontener
      descriptionSections: '.css-1fylnvr', // Kontener opisu oferty
    },
    getJobInfo: (url) => {
      const jobInfo = {
        site: "rocketjobs.pl",
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
  
      // Pobieranie firmy z pierwszego <h2> po <h1>
      if (positionElement) {
        let currentElement = positionElement.nextElementSibling;
        while (currentElement) {
          const h2Element = currentElement.querySelector('h2');
          if (h2Element) {
            jobInfo.company = h2Element.textContent.trim();
            break;
          }
          currentElement = currentElement.nextElementSibling;
        }
        if (!jobInfo.company) {
          console.warn("Nie znaleziono <h2> z nazwą firmy po <h1> ze stanowiskiem! Próbuję fallback...");
          const titleContent = document.querySelector("title")?.textContent.trim() || "";
          const titleParts = titleContent.split(" - ");
          if (titleParts && titleParts.length > 1) {
            jobInfo.company = titleParts[1].trim();
          }
        }
      } else {
        console.warn("Brak <h1> ze stanowiskiem, użyto fallback z <title> dla firmy:");
        const titleContent = document.querySelector("title")?.textContent.trim() || "";
        const titleParts = titleContent.split(" - ");
        if (titleParts && titleParts.length > 1) {
          jobInfo.company = titleParts[1].trim();
        }
      }
  
      // Pobieranie opisu od <h3> "Opis stanowiska" w dół jako ciąg tekstu
      const descriptionContainer = document.querySelector('.css-1fylnvr');
      if (descriptionContainer) {
        const startElement = descriptionContainer.querySelector('h3');
        if (startElement && startElement.textContent.trim() === 'Opis stanowiska') {
          let descriptionText = '';
          const elements = descriptionContainer.querySelectorAll('h3, p, ul, ol');
          let started = false;
          elements.forEach((element) => {
            if (element === startElement) {
              started = true; // Zaczynamy od "Opis stanowiska"
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
  
      console.log("Pobrano dane oferty z rocketjobs.pl:", jobInfo);
      return jobInfo;
    },
    getApplyButtonStyle: (applyButton) => {
      if (!applyButton) {
        console.warn("Przycisk 'Aplikuj' nie znaleziony na rocketjobs.pl – używanie domyślnych stylów.");
        return {};
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
      marginRight: "10px",
      borderRadius: "8px",
      width: "200px",
    },
    buttonInsertionMethod: "insertAfterApply",
    containerStyles: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      marginRight: "5px",
    },
  };