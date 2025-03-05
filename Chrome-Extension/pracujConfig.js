// pracujConfig.js
window.PRACUJ_CONFIG = {
    site: "pracuj.pl",
    selectors: {
      applyButton: '[data-test="button-submit"]',
      position: '[data-scroll-id][data-test="text-positionName"]',
      company: '[data-scroll-id][data-test="text-employerName"]',
      container: '.quick-apply_s1i8itcr',
      descriptionSections: '.c6g9djq',
    },
    getJobInfo: (url) => {
      const jobInfo = {
        site: "pracuj.pl",
        position: document.querySelector('[data-scroll-id][data-test="text-positionName"]')?.textContent.trim() || "",
        company: document.querySelector('[data-scroll-id][data-test="text-employerName"]')?.textContent.trim() || "",
        url: url,
        description: {},
      };
  
      const descriptionSections = document.querySelectorAll('.c6g9djq');
      descriptionSections.forEach((section) => {
        const sectionId = section.getAttribute('data-scroll-id') || section.getAttribute('data-test') || 'unknown';
        const sectionText = section.innerText.trim();
  
        if (sectionId === 'section-offer-map' || sectionId === 'job-alert') return;
  
        if (sectionText) {
          let key;
          if (sectionId.includes('technologies')) key = 'technologies';
          else if (sectionId.includes('responsibilities')) key = 'responsibilities';
          else if (sectionId.includes('requirements')) key = 'requirements';
          else if (sectionId.includes('work-organization')) key = 'workOrganization';
          else if (sectionId.includes('training-space')) key = 'trainingSpace';
          else if (sectionId.includes('offered')) key = 'offered';
          else if (sectionId.includes('benefits')) key = 'benefits';
          else if (sectionId.includes('about-project')) key = 'aboutProject';
          else if (sectionId.includes('about-us-description')) key = 'aboutUs';
          else if (sectionId.includes('about-us-gallery')) key = 'aboutUsGallery';
          else if (sectionId.includes('recruitment-stages')) key = 'recruitmentStages';
          else if (sectionId.includes('section-offerHeader')) key = 'offerHeader';
          else key = sectionId;
  
          jobInfo.description[key] = sectionText;
        }
      });
  
      if (!jobInfo.company) {
        const titleContent = document.querySelector("title")?.textContent.trim() || "";
        const titleParts = titleContent.split(", ");
        if (titleParts && titleParts.length > 1) {
          jobInfo.company = titleParts[1].trim();
        }
      }
  
      if (Object.keys(jobInfo.description).length === 0) {
        console.warn("Nie znaleziono sekcji opisu oferty na pracuj.pl!");
      } else {
        console.log("Pobrano dane oferty z pracuj.pl:", jobInfo);
      }
  
      return jobInfo;
    },
    getApplyButtonStyle: (applyButton) => {
      if (!applyButton) {
        console.info("Przycisk 'Aplikuj' nie znaleziony na pracuj.pl z selektorem [data-test=\"button-submit\"] – używanie domyślnych stylów.");
        return {
          width: "100%",
          height: "auto",
          padding: "10px 20px",
          borderRadius: "40px",
          fontSize: "16px",
          lineHeight: "normal",
        };
      }
      try {
        const computedStyle = window.getComputedStyle(applyButton);
        return {
          width: computedStyle.width,
          height: computedStyle.height,
          padding: computedStyle.padding,
          borderRadius: computedStyle.borderRadius,
          fontSize: computedStyle.fontSize,
          lineHeight: computedStyle.lineHeight,
        };
      } catch (e) {
        console.warn("Błąd podczas pobierania stylów przycisku 'Aplikuj':", e);
        return {
          width: "100%",
          height: "auto",
          padding: "10px 20px",
          borderRadius: "20px",
          fontSize: "16px",
          lineHeight: "normal",
        };
      }
    },
    buttonStyles: {
      height: "54px",
      marginTop: "-20px",
      borderRadius: "40px",
    },
    buttonInsertionMethod: "appendToContainer",
  };