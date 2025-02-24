// const { combineEventHandlers } = require("recharts/types/util/ChartUtils");

let isExtensionValid = true;
let buttonCheckTimeout = null;
let lastCheckedUrl = null;
let lastProcessedJobId = null;

// Funkcja do sprawdzania stanu rozszerzenia
function checkExtensionContext() {
    try {
        chrome.runtime.getURL('');
        return true;
    } catch (e) {
        isExtensionValid = false;
        return false;
    }
}

async function getJobInfo() {
    const currentUrl = window.location.href;

    let jobInfo = {
        site: '',
        position: '',
        company: '',
        url: currentUrl,
        status: 'Zapisana',
        responsibilities: '',
        requirements: '',
        fullText: ''
    };

    if (currentUrl.includes("pracuj.pl")) {
        jobInfo.site = "pracuj.pl";
        jobInfo.position = document.querySelector('[data-scroll-id][data-test="text-positionName"]')?.textContent.trim() || "";
        const titleContent = document.querySelector('title')?.textContent.trim() || "";
        const titleParts = titleContent.split(", ");
        if (titleParts && titleParts.length > 1) {
            jobInfo.company = titleParts[1].trim();
        } else {
            jobInfo.company = document.querySelector('[data-scroll-id][data-test="text-employerName"]')?.textContent.trim() || "";
        }

        // Pobieranie pełnego tekstu ogłoszenia
        const fullTextSections = [];
        
        // Pobieranie opisu stanowiska
        const positionDescription = document.querySelector('[data-scroll-id="position-description-1"]');
        if (positionDescription) {
            fullTextSections.push(positionDescription.textContent.trim());
        }

        // Pobieranie obowiązków
        const responsibilitiesSection = document.querySelector('[data-scroll-id="responsibilities-1"]');
        if (responsibilitiesSection) {
            const responsibilities = [];
            const header = responsibilitiesSection.querySelector('h2')?.textContent.trim();
            if (header) responsibilities.push(header);

            const listItems = responsibilitiesSection.querySelectorAll('li');
            listItems.forEach(item => {
                responsibilities.push('• ' + item.textContent.trim());
            });

            jobInfo.responsibilities = responsibilities.join('\n');
            fullTextSections.push(responsibilities.join('\n'));
        }

        // Pobieranie wymagań
        const requirementsSection = document.querySelector('[data-scroll-id="requirements-1"]');
        if (requirementsSection) {
            const requirements = [];
            const header = requirementsSection.querySelector('h2')?.textContent.trim();
            if (header) requirements.push(header);

            const expectedSection = requirementsSection.querySelector('[data-scroll-id="requirements-expected-1"]');
            if (expectedSection) {
                const expectedItems = expectedSection.querySelectorAll('li');
                expectedItems.forEach(item => {
                    requirements.push('• ' + item.textContent.trim());
                });
            }

            const optionalSection = requirementsSection.querySelector('[data-scroll-id="requirements-optional-1"]');
            if (optionalSection) {
                const optionalTitle = optionalSection.querySelector('[data-test="requirements-optional-title"]')?.textContent.trim();
                if (optionalTitle) requirements.push('\n' + optionalTitle);

                const optionalItems = optionalSection.querySelectorAll('li');
                optionalItems.forEach(item => {
                    requirements.push('• ' + item.textContent.trim());
                });
            }

            jobInfo.requirements = requirements.join('\n');
            fullTextSections.push(requirements.join('\n'));
        }

        // Pobieranie benefitów
        const benefitsSection = document.querySelector('[data-scroll-id="benefits-1"]');
        if (benefitsSection) {
            const benefits = [];
            const header = benefitsSection.querySelector('h2')?.textContent.trim();
            if (header) benefits.push(header);

            const listItems = benefitsSection.querySelectorAll('li');
            listItems.forEach(item => {
                benefits.push('• ' + item.textContent.trim());
            });

            fullTextSections.push(benefits.join('\n'));
        }

        // Pobieranie informacji o pracodawcy
        const aboutEmployerSection = document.querySelector('[data-scroll-id="about-employer-1"]');
        if (aboutEmployerSection) {
            fullTextSections.push(aboutEmployerSection.textContent.trim());
        }

        // Łączenie wszystkich sekcji w jeden tekst
        if (fullTextSections.length > 0) {
            jobInfo.fullText = fullTextSections.join('\n\n');
        }
        jobInfo.fullText = jobInfo.fullText.replace(/\n/g, '<br>')
        
    } else if (currentUrl.includes("rocketjobs.pl")) {
        jobInfo.site = "rocketjobs.pl";
        jobInfo.position = document.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim() || "";
        jobInfo.company = document.querySelector('div.MuiBox-root.css-s52zl1 > div.MuiBox-root.css-v060vo > div.MuiBox-root.css-17l5f79 > a > div > h2')?.textContent.trim() || "";
        
        // Pobieranie pełnego opisu
        const jobDescriptionSection = document.querySelector('.MuiBox-root.css-98srlg');
        if (jobDescriptionSection) {
            // Pobieranie pełnego tekstu
            jobInfo.fullText = jobDescriptionSection.innerText;
            jobInfo.fullText = jobInfo.fullText.replace(/\n/g, '<br>')
            
            // Pobieranie obowiązków
            const responsibilities = [];
            const jobTitleDesc = Array.from(jobDescriptionSection.querySelectorAll('p')).find(
                p => p.textContent?.trim().toLowerCase() === 'job title description'
            );
            
            if (jobTitleDesc) {
                let currentElement = jobTitleDesc;
                while (currentElement && currentElement.nextElementSibling) {
                    currentElement = currentElement.nextElementSibling;
                    if (currentElement.tagName === 'UL') {
                        const items = currentElement.querySelectorAll('li');
                        items.forEach(item => {
                            responsibilities.push('• ' + item.textContent.trim());
                        });
                        break;
                    }
                }
            }
            
            if (responsibilities.length > 0) {
                jobInfo.responsibilities = responsibilities.join('\n');
            }
            
            // Pobieranie wymagań
            const requirements = [];
            const requirementsHeader = Array.from(jobDescriptionSection.querySelectorAll('p')).find(
                p => p.textContent?.trim().toLowerCase() === 'requirements'
            );
            
            if (requirementsHeader) {
                let currentElement = requirementsHeader;
                while (currentElement && currentElement.nextElementSibling) {
                    currentElement = currentElement.nextElementSibling;
                    if (currentElement.tagName === 'UL') {
                        const items = currentElement.querySelectorAll('li');
                        items.forEach(item => {
                            requirements.push('• ' + item.textContent.trim());
                        });
                        break;
                    }
                }
            }
            
            if (requirements.length > 0) {
                jobInfo.requirements = requirements.join('\n');
            }
        }
    } else if (window.location.href.includes("nofluffjobs.com")) {
        jobInfo.site = "nofluffjobs.com";
        jobInfo.position = document.querySelector('h1.font-weight-bold')?.textContent.trim() || "";
        
        // Znajdowanie elementu z nazwą firmy
        const companyElement = document.querySelector('#postingCompanyUrl') ||
                               document.querySelector('.inline-info.d-flex.align-items-center') ||
                               document.querySelector('.posting-details-description h1.font-weight-bold.bigger + a.inline-info.d-flex.align-items-center.ng-star-inserted');
        
        if (companyElement) {
            jobInfo.company = companyElement.textContent.trim();
        }

        // Zbieranie pełnego tekstu i sekcji
        const fullTextSections = [];

        // Funkcja pomocnicza do znajdowania sekcji po nagłówku
        function findSectionByHeader(headerText) {
            const sections = document.querySelectorAll('section');
            for (const section of sections) {
                const header = section.querySelector('h2');
                if (header && header.textContent.trim().toLowerCase().includes(headerText.toLowerCase())) {
                    return section;
                }
            }
            return null;
        }

        // Pobieranie wymagań obowiązkowych
        const mandatorySection = findSectionByHeader('Obowiązkowe');
        if (mandatorySection) {
            const mandatoryItems = Array.from(mandatorySection.querySelectorAll('li')).map(item => 
                '• ' + item.textContent.trim()
            );
            if (mandatoryItems.length > 0) {
                fullTextSections.push('Wymagania obowiązkowe:\n' + mandatoryItems.join('\n'));
            }
        }

        // Pobieranie opisu wymagań
        const requirementsSection = findSectionByHeader('Opis wymagań');
        if (requirementsSection) {
            const requirements = [];
            const reqItems = requirementsSection.querySelectorAll('li');
            reqItems.forEach(item => {
                requirements.push('• ' + item.textContent.trim());
            });
            if (requirements.length > 0) {
                jobInfo.requirements = requirements.join('\n');
                fullTextSections.push('Opis wymagań:\n' + requirements.join('\n'));
            }
        }

        // Pobieranie opisu oferty
        const offerSection = findSectionByHeader('Opis oferty');
        if (offerSection) {
            fullTextSections.push('Opis oferty:\n' + offerSection.textContent.trim());
        }

        // Pobieranie zakresu obowiązków
        const responsibilitiesSection = findSectionByHeader('Zakres obowiązków');
        if (responsibilitiesSection) {
            const responsibilities = [];
            const respItems = responsibilitiesSection.querySelectorAll('li');
            respItems.forEach(item => {
                responsibilities.push('• ' + item.textContent.trim());
            });
            if (responsibilities.length > 0) {
                jobInfo.responsibilities = responsibilities.join('\n');
                fullTextSections.push('Zakres obowiązków:\n' + responsibilities.join('\n'));
            }
        }

        // Pobieranie szczegółów oferty
        const detailsSection = findSectionByHeader('Szczegóły oferty');
        if (detailsSection) {
            fullTextSections.push('Szczegóły oferty:\n' + detailsSection.textContent.trim());
        }

        // Pobieranie informacji o sprzęcie
        const equipmentSection = findSectionByHeader('Sprzęt');
        if (equipmentSection) {
            fullTextSections.push('Sprzęt:\n' + equipmentSection.textContent.trim());
        }

        // Pobieranie informacji o metodologii
        const methodologySection = findSectionByHeader('Metodologia');
        if (methodologySection) {
            fullTextSections.push('Metodologia:\n' + methodologySection.textContent.trim());
        }

        // Pobieranie benefitów
        const benefitsSection = findSectionByHeader('Benefity');
        if (benefitsSection) {
            fullTextSections.push('Benefity:\n' + benefitsSection.textContent.trim());
        }

        // Łączenie wszystkich sekcji w jeden tekst
        if (fullTextSections.length > 0) {
            jobInfo.fullText = fullTextSections.join('\n\n');
        }
    } else if (currentUrl.includes("indeed.com")) {
        jobInfo.site = "indeed.com";
        
        // Pobieranie tytułu stanowiska
        const positionElement = document.querySelector('h2.jobsearch-JobInfoHeader-title');
        if (positionElement) {
            jobInfo.position = positionElement.textContent.trim().replace(/ - job post$/, "");
        }

        // Pobieranie nazwy firmy
        const companyElement = document.querySelector('[data-company-name="true"]');
        if (companyElement) {
            jobInfo.company = companyElement.textContent.trim();
        }

        // Pobieranie pełnego opisu
        const jobDescriptionElement = document.querySelector('#jobDescriptionText');
        if (jobDescriptionElement) {
            // Zapisujemy pełny tekst
            jobInfo.fullText = jobDescriptionElement.innerText
                // .split('\n')
                // .map(line => line.trim())
                // .filter(line => line)
                // .join('\n');
            jobInfo.fullText = jobInfo.fullText.replace(/\n/g, '<br>')
            // Szukamy sekcji obowiązków
            const responsibilities = [];
            const responsibilitiesKeywords = ['obowiązki:', 'zadania:', 'zakres obowiązków:', 'responsibilities:', 'duties:', 'what you"ll do:', 'your responsibilities:'];
            
            let content = jobDescriptionElement.innerHTML;
            let lines = content.split(/<br\s*\/?>/i);
            let currentSection = '';
            
            for (let line of lines) {
                // Usuwamy tagi HTML
                line = line.replace(/<[^>]*>/g, '').trim();
                if (!line) continue;
                
                const lowerLine = line.toLowerCase();
                
                // Sprawdzamy czy to początek sekcji obowiązków
                if (responsibilitiesKeywords.some(keyword => lowerLine.includes(keyword))) {
                    currentSection = 'responsibilities';
                    responsibilities.push(line);
                    continue;
                }
                
                // Sprawdzamy czy to początek innej sekcji
                if (lowerLine.includes('wymagania:') || lowerLine.includes('requirements:') || 
                    lowerLine.includes('oferujemy:') || lowerLine.includes('we offer:')) {
                    currentSection = '';
                    continue;
                }
                
                // Jeśli jesteśmy w sekcji obowiązków i linia zaczyna się od myślnika lub bulletpointa
                if (currentSection === 'responsibilities' && 
                    (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
                    responsibilities.push(line);
                }
            }
            
            if (responsibilities.length > 0) {
                jobInfo.responsibilities = responsibilities.join('\n');
            }

            // Szukamy sekcji wymagań
            const requirements = [];
            const requirementsKeywords = ['wymagania:', 'requirements:', 'qualifications:', 'what you need:', 'required skills:'];
            
            currentSection = '';
            lines = content.split(/<br\s*\/?>/i);
            
            for (let line of lines) {
                // Usuwamy tagi HTML
                line = line.replace(/<[^>]*>/g, '').trim();
                if (!line) continue;
                
                const lowerLine = line.toLowerCase();
                
                // Sprawdzamy czy to początek sekcji wymagań
                if (requirementsKeywords.some(keyword => lowerLine.includes(keyword))) {
                    currentSection = 'requirements';
                    requirements.push(line);
                    continue;
                }
                
                // Sprawdzamy czy to początek innej sekcji
                if (lowerLine.includes('oferujemy:') || lowerLine.includes('we offer:') ||
                    lowerLine.includes('obowiązki:') || lowerLine.includes('responsibilities:')) {
                    currentSection = '';
                    continue;
                }
                
                // Jeśli jesteśmy w sekcji wymagań i linia zaczyna się od myślnika lub bulletpointa
                if (currentSection === 'requirements' && 
                    (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
                    requirements.push(line);
                }
            }
            
            if (requirements.length > 0) {
                jobInfo.requirements = requirements.join('\n');
            }
        }
    } else if (currentUrl.includes("gowork.pl")) {
        jobInfo.site = "gowork.pl";
        
        // Pobierz zawartość tagu <script type="application/ld+json">
        const jobPostingJson = document.querySelector('script[type="application/ld+json"]')?.textContent.trim();
    
        // Jeśli znaleziono dane w JSON, przetwarzamy je
        if (jobPostingJson) {
            try {
                // Parsowanie JSON do obiektu JavaScript
                const jobData = JSON.parse(jobPostingJson);
    
                // Wyciąganie stanowiska i nazwy firmy
                jobInfo.position = jobData.title || '';
                jobInfo.company = jobData.hiringOrganization?.name || '';

                // Pobieranie pełnego opisu
                if (jobData.description) {
                    jobInfo.fullText = jobData.description;
                }
            } catch (error) {
                console.error('Błąd podczas parsowania JSON:', error);
            }
        }

        // Pobieranie treści z sekcji opisu stanowiska
        const jobDescriptionSection = document.querySelector('.job-description');
        if (jobDescriptionSection) {
            // Próba pobrania obowiązków
            const responsibilitiesSection = Array.from(jobDescriptionSection.querySelectorAll('h3, h4, strong, b')).find(
                el => el.textContent?.toLowerCase().includes('obowiązki') || 
                      el.textContent?.toLowerCase().includes('zadania') ||
                      el.textContent?.toLowerCase().includes('zakres')
            );

            if (responsibilitiesSection) {
                const responsibilities = [];
                let currentElement = responsibilitiesSection;
                
                while (currentElement && currentElement.nextElementSibling) {
                    currentElement = currentElement.nextElementSibling;
                    
                    // Jeśli napotkamy nowy nagłówek, przerywamy
                    if (currentElement.tagName === 'H3' || currentElement.tagName === 'H4' || 
                        currentElement.querySelector('strong, b')) {
                        break;
                    }
                    
                    // Zbieramy punkty z listy lub paragrafy
                    if (currentElement.tagName === 'UL') {
                        const items = currentElement.querySelectorAll('li');
                        items.forEach(item => {
                            responsibilities.push('• ' + item.textContent.trim());
                        });
                    } else if (currentElement.tagName === 'P') {
                        responsibilities.push(currentElement.textContent.trim());
                    }
                }
                
                if (responsibilities.length > 0) {
                    jobInfo.responsibilities = responsibilities.join('\n');
                }
            }

            // Próba pobrania wymagań
            const requirementsSection = Array.from(jobDescriptionSection.querySelectorAll('h3, h4, strong, b')).find(
                el => el.textContent?.toLowerCase().includes('wymagania') || 
                      el.textContent?.toLowerCase().includes('oczekiwania') ||
                      el.textContent?.toLowerCase().includes('wymagane')
            );

            if (requirementsSection) {
                const requirements = [];
                let currentElement = requirementsSection;
                
                while (currentElement && currentElement.nextElementSibling) {
                    currentElement = currentElement.nextElementSibling;
                    
                    // Jeśli napotkamy nowy nagłówek, przerywamy
                    if (currentElement.tagName === 'H3' || currentElement.tagName === 'H4' || 
                        currentElement.querySelector('strong, b')) {
                        break;
                    }
                    
                    // Zbieramy punkty z listy lub paragrafy
                    if (currentElement.tagName === 'UL') {
                        const items = currentElement.querySelectorAll('li');
                        items.forEach(item => {
                            requirements.push('• ' + item.textContent.trim());
                        });
                    } else if (currentElement.tagName === 'P') {
                        requirements.push(currentElement.textContent.trim());
                    }
                }
                
                if (requirements.length > 0) {
                    jobInfo.requirements = requirements.join('\n');
                }
            }
        }
    } else if (currentUrl.includes("linkedin.com")) {
        jobInfo.site = "linkedin.com";
        jobInfo.position = document.querySelector('.job-details-jobs-unified-top-card__job-title h1')?.textContent.trim() || "";
        jobInfo.company = document.querySelector('.job-details-jobs-unified-top-card__company-name')?.textContent.trim() || "";
        
        const jobDescription = document.querySelector('.jobs-description');
        if (jobDescription) {
            // Zachowaj formatowanie HTML
            const clonedDescription = jobDescription.cloneNode(true);
            
            // Usuń niepotrzebne elementy
            clonedDescription.querySelectorAll('button, style, script').forEach(el => el.remove());
            
            // Zamień wszystkie <br> na <p>
            clonedDescription.querySelectorAll('br').forEach(br => {
                const p = document.createElement('p');
                br.replaceWith(p);
            });
            
            // Zachowaj formatowanie list
            clonedDescription.querySelectorAll('ul').forEach(ul => {
                const items = Array.from(ul.querySelectorAll('li'))
                    .map(li => li.innerHTML)
                    .join('</li><li>');
                ul.innerHTML = `<li>${items}</li>`;
            });
            
            // Wyczyść niepotrzebne atrybuty i tagi, ale zachowaj strukturę
            const cleanHtml = clonedDescription.innerHTML
                .replace(/<(?!\/?(?:p|br|ul|li|strong))[^>]+>/g, '') // Zachowaj tylko potrzebne tagi
                .replace(/<!--.*?-->/g, '') // Usuń komentarze HTML
                .replace(/\s+/g, ' ') // Usuń nadmiarowe białe znaki
                .replace(/<p>\s*<\/p>/g, '<p><br></p>') // Zamień puste paragrafy na paragrafy z <br>
                .trim();
            
            jobInfo.fullText = cleanHtml;
            
            // Pobierz tytuł i firmę
            const title = document.querySelector('.jobs-unified-top-card__job-title');
            if (title) jobInfo.position = title.textContent.trim();
            
            const company = document.querySelector('.jobs-unified-top-card__company-name');
            if (company) jobInfo.company = company.textContent.trim();
            
            // Wyodrębnij wymagania i obowiązki
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cleanHtml;
            
            const findSection = (keywords) => {
                let section = '';
                let foundStart = false;
                let elements = tempDiv.children;
                
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    const text = element.textContent.toLowerCase();
                    
                    if (!foundStart) {
                        if (keywords.some(keyword => text.includes(keyword))) {
                            foundStart = true;
                    continue;
                }
                    } else {
                        if (element.tagName === 'UL') {
                            section += element.outerHTML;
                        } else if (element.textContent.trim() && 
                                 !keywords.some(keyword => text.includes(keyword))) {
                            section += element.outerHTML;
                        } else {
                            break;
                        }
                    }
                }
                return section;
            };
            
            jobInfo.requirements = findSection(['what you need', 'requirements', 'qualifications']);
            jobInfo.responsibilities = findSection(['what you will', 'responsibilities', 'your role']);
        }
    }

    return jobInfo;
}

// Nasłuchuj na zmiany w localStorage w aplikacji webowej
if (window.location.href.startsWith('http://localhost:3000')) {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.apply(this, arguments);
        
        // Sprawdź różne możliwe formaty tokenu
        const possibleTokenKeys = [
            'supabase.auth.token',
            'sb-access-token',
            'supabase_access_token'
        ];

        if (possibleTokenKeys.includes(key)) {
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
                    chrome.runtime.sendMessage({
                        action: 'setTokens',
                        tokens: {
                            access_token: accessToken,
                            refresh_token: refreshToken
                        }
                    }, response => {
                        if (chrome.runtime.lastError) {
                            console.error('Błąd podczas wysyłania tokenów:', chrome.runtime.lastError);
                        } else if (response && response.success) {
                            console.log('Tokeny zostały zaktualizowane');
                        }
                    });
                }
            } catch (e) {
                console.error('Błąd podczas przetwarzania tokenu:', e);
            }
        }
    };
}

// Nasłuchuj na wiadomości z background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'tokenUpdated') {
        // Odpowiedz natychmiast
        sendResponse({ received: true });
        
        // Zaktualizuj tokeny w localStorage
        if (request.token) {
            try {
                localStorage.setItem('supabase_access_token', request.token);
                if (request.refresh_token) {
                    localStorage.setItem('supabase_refresh_token', request.refresh_token);
                }
            } catch (e) {
                console.error('Błąd podczas aktualizacji tokenów w localStorage:', e);
            }
        }
    }
    return true; // Informuje Chrome, że odpowiedź może być asynchroniczna
});

async function getSupabaseToken() {
    return new Promise((resolve, reject) => {
        if (!checkExtensionContext()) {
            reject(new Error('Kontekst rozszerzenia został unieważniony. Odśwież stronę.'));
            return;
        }

        chrome.runtime.sendMessage({ action: 'getToken' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error:', chrome.runtime.lastError);
                reject(new Error('Błąd komunikacji z rozszerzeniem'));
                return;
            }
            
            if (response && response.token) {
                resolve(response.token);
            } else {
                reject(new Error('Nie znaleziono tokenu. Zaloguj się do aplikacji.'));
            }
        });
    });
}

// Funkcja debounce do ograniczenia częstotliwości sprawdzania
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Zmodyfikowana funkcja sprawdzania stanu przycisku
async function checkButtonState(saveButton) {
    const currentUrl = window.location.href;
    
    // Jeśli już sprawdzaliśmy ten URL, pomijamy
    if (lastCheckedUrl === currentUrl) {
        return;
    }
    
    lastCheckedUrl = currentUrl;
    
    chrome.storage.local.get(['supabase_access_token'], async (result) => {
        if (result.supabase_access_token) {
            try {
                const response = await fetch('http://localhost:3000/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${result.supabase_access_token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    const savedKey = `saved_${userData.id}_${currentUrl}`;
                    
                    chrome.storage.local.get([savedKey], (result) => {
                        if (result[savedKey]) {
                            saveButton.textContent = "Zapisano";
                            saveButton.classList.add('save-button-saved');
                            saveButton.disabled = true;
                        }
                    });
                }
            } catch (error) {
                console.error('Błąd podczas pobierania danych użytkownika:', error);
            }
        }
    });
}

// Zmodyfikuj funkcję createSaveButton
function createSaveButton() {
    const currentUrl = window.location.href;
    const saveButton = document.createElement('button');
    saveButton.id = 'saveButton';
    saveButton.textContent = '+ JustSend.cv';
    
    // Dodajemy klasę fixed tylko dla określonych stron
    if (!currentUrl.includes('linkedin.com')) {
        saveButton.classList.add('save-button', 'fixed');
    } else {
        saveButton.classList.add('save-button');
    }

    // Dodajemy obsługę kliknięcia
    saveButton.addEventListener('click', async () => {
        if (!checkExtensionContext()) {
            saveButton.textContent = "Odśwież stronę";
            saveButton.disabled = true;
            return;
        }

        saveButton.textContent = "Zapisywanie...";
        const data = await getJobInfo();
        try {
            // Pobierz token przez background script
            const token = await getSupabaseToken();

            // Najpierw pobierz dane użytkownika
            const userResponse = await fetch('http://localhost:3000/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!userResponse.ok) {
                throw new Error('Nie udało się pobrać danych użytkownika');
            }

            const userData = await userResponse.json();

            const response = await fetch('http://localhost:3000/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    site: data.site,
                    position: data.position,
                    company: data.company,
                    url: data.url,
                    status: data.status,
                    responsibilities: data.responsibilities,
                    requirements: data.requirements,
                    fullText: data.fullText
                }),
            });

            if (response.ok) {
                saveButton.textContent = "Zapisano";
                saveButton.classList.add('save-button-saved');
                saveButton.disabled = true;
                
                if (checkExtensionContext()) {
                // Zapisz informację o zapisanej ofercie z ID użytkownika
                const savedKey = `saved_${userData.id}_${currentUrl}`;
                chrome.storage.local.set({ 
                    [savedKey]: {
                        timestamp: new Date().toISOString(),
                        userId: userData.id,
                        jobData: data
                    }
                });

                    // Odśwież stronę /saved jeśli jest otwarta
                    chrome.runtime.sendMessage({
                        action: 'refreshSavedPage',
                        targetUrl: 'http://localhost:3000/saved'
                    }).catch(error => {
                        console.log('Błąd podczas odświeżania strony saved:', error);
                    });
                }
            } else {
                const errorText = await response.text();
                console.error('Błąd zapisu:', response.status, errorText);
                saveButton.textContent = "Błąd zapisu";
            }
        } catch (error) {
            console.error('Błąd:', error);
            saveButton.textContent = error.message === 'Kontekst rozszerzenia został unieważniony. Odśwież stronę.' 
                ? "Odśwież stronę" 
                : "Błąd zapisu";
        }
    });

    // Sprawdzamy stan przycisku
    checkButtonState(saveButton);

    return saveButton;
}

function createSidePanel() {
    // Tworzenie kontenera dla panelu bocznego
    const sidePanel = document.createElement('div');
    sidePanel.id = 'justSendSidePanel';
    sidePanel.className = 'side-panel';
    
    // Tworzenie nagłówka panelu
    const header = document.createElement('div');
    header.className = 'side-panel-header';
    
    const title = document.createElement('h2');
    title.textContent = '+ JustSend.cv';
    header.appendChild(title);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => sidePanel.classList.remove('open');
    header.appendChild(closeButton);
    
    // Tworzenie kontenera na treść
    const content = document.createElement('div');
    content.className = 'side-panel-content';
    
    // Dodawanie elementów do panelu
    sidePanel.appendChild(header);
    sidePanel.appendChild(content);
    
    // Dodawanie panelu do body
    document.body.appendChild(sidePanel);
    
    return sidePanel;
}

function createSidePanelButton() {
    const button = document.createElement('button');
    button.id = 'sidePanelButton';
    button.className = 'side-panel-button';
    
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icon64.png');
    icon.alt = '+ JustSend.cv';
    button.appendChild(icon);
    
    document.body.appendChild(button);
    
    const sidePanel = createSidePanel();
    
    button.addEventListener('click', async () => {
        const jobInfo = await getJobInfo();
        const content = sidePanel.querySelector('.side-panel-content');
        
        content.innerHTML = `
            <div class="job-info">
                <h3>${jobInfo.position}</h3>
                <h4>${jobInfo.company}</h4>
                <div class="job-description">
                    ${jobInfo.fullText ? `
                        <div class="section">
                            <h5>Pełny opis:</h5>
                           ${jobInfo.fullText}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        sidePanel.classList.add('open');
    });
    
    return button;
}

// Modyfikacja funkcji injectSaveButton aby dodać przycisk panelu bocznego
function injectSaveButton() {
    const currentUrl = window.location.href;
    let targetElement;
    let saveButton;
    
    // Dodaj przycisk panelu bocznego
    if (!document.querySelector('#sidePanelButton')) {
        createSidePanelButton();
    }
    
    // Jeśli przycisk już istnieje, nie dodawaj go ponownie
    if (document.querySelector('#saveButton')) {
        return;
    }
    
    if (currentUrl.includes("pracuj.pl")) {
        targetElement = document.querySelector('.s1i8itcr');
        if (targetElement && !document.querySelector('#saveButton')) {
             {
            saveButton = createSaveButton();
            saveButton.style.width = '290px';
            saveButton.style.marginTop = '-20px';
            saveButton.style.marginBottom = '10px';
            //saveButton.classList.add('save-button', 'save-button-saved', 'fixed');
            
        targetElement.parentNode.insertBefore(saveButton, targetElement.nextSibling);
            }}  //dziala

    } else if (currentUrl.includes("rocketjobs.pl")) {
        targetElement = document.querySelector('[name="floating_apply_button"]');
        if (targetElement && !document.querySelector('#saveButton')) {
            {
            saveButton = createSaveButton();
            //saveButton.style.position = 'absolute';
            saveButton.style.marginTop = '5px';
            saveButton.style.position = 'absolute';
            saveButton.style.marginRight = '10px';
            saveButton.style.right = '100%';
            saveButton.style.borderRadius = '15px';
            saveButton.style.height = '48px';
            saveButton.style.width = '280px';
            saveButton.style.zIndex = '999999';
            saveButton.addEventListener('click', function(event) {
                event.stopPropagation();
                        });
            targetElement.style.position = 'relative';
            targetElement.appendChild(saveButton);
        }}  //dziala
    } else if (currentUrl.includes("nofluffjobs.com"))
        targetElement = document.querySelector('.d-block.mb-3');
        if (targetElement && !document.querySelector('#saveButton')) {
            {
        saveButton = createSaveButton();
        saveButton.style.marginTop = '-5px';
        saveButton.style.marginBottom = '15px';
        saveButton.style.marginLeft = 'auto';
        saveButton.style.marginRight = 'auto';
        saveButton.style.borderRadius = '7px';
        saveButton.style.height = '60px';
        saveButton.style.width = '310px'
        targetElement = document.querySelector('.d-block.mb-3');
        if (targetElement && !document.querySelector('#saveButton')) {
            targetElement.parentNode.insertBefore(saveButton, targetElement.nextSibling);
        }     
    }
    } else if (currentUrl.includes("indeed.com") && !currentUrl.includes("indeed.com/viewjob")) {
        setTimeout(() => {
            // Checking for possible selectors to find the appropriate container
            targetElement = //document.querySelector('#applyButtonLinkContainer') || 
                            //document.querySelector('#indeedApplyButton') || 
                            //document.querySelector('#saveJobButtonContainer') || 
                            //document.querySelector('#mosaic-belowViewjobButtons') ||
                            document.querySelector('#viewJobButtonLinkContainer') ||
                            document.querySelector('#ia-IndeedApplyButton') || // Fixed this line for missing `||`
                            document.querySelector('#saveJobButtonContainerv') ||
                            document.querySelector('.jobsearch-ButtonContainer-inlineBlock') ||
            console.log("ok"); // Check which element was found
    
            if (targetElement && !targetElement.querySelector('#saveButton')) { // Check if the container doesn't already have the save button
                saveButton = createSaveButton(); // Create the save button
                
                // Button styling
                saveButton.style.height = '44px';
                saveButton.style.marginTop = '6px';
                saveButton.style.borderRadius = '10px';
                saveButton.style.width = '280px';
                // saveButton.style.position = 'relative';
                //targetElement = targetElement.nextElementSibling
                //targetElement.parentNode.insertBefore(saveButton, targetElement.nextElementSibling)
                // Append the button to the target container
                console.log(targetElement);
                targetElement.appendChild(saveButton);
            }
        }, 1000); // Wait for a second to ensure elements are loaded
        
    } else if (currentUrl.includes("indeed.com/viewjob")) {
            setTimeout(() => {
                // Checking for possible selectors to find the appropriate container
                targetElement = document.querySelector('#applyButtonLinkContainer') || 
                                document.querySelector('.jobsearch-IndeedApplyButton-buttonWrapper') || 
                                //document.querySelector('#saveJobButtonContainer') || 
                                //document.querySelector('#mosaic-aboveViewjobButtons') ||
                                //document.querySelector('#viewJobButtonLinkContainer') ||
                                document.querySelector('#ia-IndeedApplyButton') || // Fixed this line for missing `||`
                                document.querySelector('#saveJobButtonContainerv') ||
                                document.querySelector('#jobsearch-IndeedApplyButton-newDesign') 
                console.log("ok"); // Check which element was found
        
                if (targetElement && !targetElement.querySelector('#saveButton')) { // Check if the container doesn't already have the save button
                    saveButton = createSaveButton(); // Create the save button
                    
                    // Button styling
                    saveButton.style.height = '44px';
                    saveButton.style.marginTop = '6px';
                    saveButton.style.borderRadius = '10px';
                    saveButton.style.width = '350px';
                    saveButton.style.position = 'relative';
                    //targetElement = targetElement.nextElementSibling
                    //targetElement.parentNode.insertBefore(saveButton)
                    // Append the button to the target container
                    console.log(targetElement);
                    targetElement.appendChild(saveButton);
                    
                }
            }, 1000); // Wait for a second to ensure elements are loaded    
            
    } else if (currentUrl.includes("linkedin.com")) {        
        setTimeout(() => {
            saveButton = createSaveButton();
            saveButton.style.width = '120px';
            saveButton.style.height = '40px';
            saveButton.style.marginRight = '8px';
            saveButton.style.borderRadius = '24px';
            saveButton.style.fontSize = '16px';
            saveButton.style.position = 'static';
            saveButton.style.display = 'inline-flex';
            saveButton.style.alignItems = 'center';
            saveButton.style.justifyContent = 'center';
            
            // Znajdujemy przycisk Save
            const saveButtonLinkedIn = document.querySelector('.jobs-apply-button--top-card');
            if (saveButtonLinkedIn && !document.querySelector('#saveButton')) {
                saveButtonLinkedIn.parentNode.insertBefore(saveButton, saveButtonLinkedIn);
            }
        }, 1000);

    } else if (currentUrl.includes("gowork.pl")) {
        setTimeout(() => {
            saveButton = createSaveButton();
            saveButton.style.width = '317px';
            saveButton.style.height = '58px';
            saveButton.style.position = 'relative';
            saveButton.style.alignSelf = 'center'; // Dodanie stylu alignSelf dla przycisku
            targetElement = document.querySelector('[data-testid="first-application-button"]');
            const nextElement = targetElement.nextElementSibling; // Pobranie następnego elementu
            if (nextElement && !document.querySelector('#saveButton')) {
                nextElement.parentNode.insertBefore(saveButton, targetElement.nextSibling);
            }
        }, 600);
    }
    
}

// Zmodyfikuj obserwator
const debouncedInjectButton = debounce(() => {
    if (!document.querySelector('#saveButton') && isExtensionValid) {
        injectSaveButton();
    }
}, 1000); // 1 sekunda debounce

const observer = new MutationObserver(debouncedInjectButton);

if (isExtensionValid) {
observer.observe(document.body, { childList: true, subtree: true });
    injectSaveButton();
}


// Nasłuchuj na aktualizacje tokena z background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'tokenUpdated') {
    // Zaktualizuj token w localStorage
    localStorage.setItem('supabase_access_token', request.token);
    console.log('Token został zaktualizowany');
  }
});

// Funkcja do resetowania przycisku
function resetSaveButton() {
    const saveButton = document.querySelector('#saveButton');
    if (saveButton) {
        saveButton.textContent = '+ JustSend.cv';
        saveButton.classList.remove('save-button-saved');
        saveButton.disabled = false;
    }
}

// Funkcja do wyodrębniania ID oferty z URL
function getJobIdFromUrl(url) {
    const match = url.match(/currentJobId=(\d+)/);
    return match ? match[1] : null;
}

// Dodaj obserwator URL
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
        const currentJobId = getJobIdFromUrl(window.location.href);
        if (currentJobId && currentJobId !== lastProcessedJobId) {
            lastProcessedJobId = currentJobId;
            resetSaveButton();
            // Sprawdź czy oferta jest już zapisana
            chrome.storage.local.get(['supabase_access_token'], async (result) => {
                if (result.supabase_access_token) {
                    try {
                        const response = await fetch('http://localhost:3000/api/user/me', {
                            headers: {
                                'Authorization': `Bearer ${result.supabase_access_token}`
                            }
                        });
                        
                        if (response.ok) {
                            const userData = await response.json();
                            const savedKey = `saved_${userData.id}_${window.location.href}`;
                            
                            chrome.storage.local.get([savedKey], (result) => {
                                const saveButton = document.querySelector('#saveButton');
                                if (result[savedKey] && saveButton) {
                                    saveButton.textContent = "Zapisano";
                                    saveButton.classList.add('save-button-saved');
                                    saveButton.disabled = true;
                    }
                });
            }
                    } catch (error) {
                        console.error('Błąd podczas sprawdzania stanu oferty:', error);
                    }
                }
            });
        }
        lastUrl = window.location.href;
    }
});

// Uruchom obserwator URL dla LinkedIn
if (window.location.href.includes('linkedin.com/jobs')) {
    urlObserver.observe(document, { subtree: true, childList: true });
}