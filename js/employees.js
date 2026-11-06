/**
 * employees.js - თანამშრომლების გვერდის ლოგიკა
 * API: https://jsonplaceholder.typicode.com/users
 * ფუნქციონალი: Fetch API (async/await), HTTP status handling, Loading/Error/Retry, Search filter
 */

// გლობალური ცვლადები მდგომარეობის შესანახად
let employeesList = [];

document.addEventListener('DOMContentLoaded', () => {
    initEmployeesPage();
});

/**
 * თანამშრომლების გვერდის ინიციალიზაცია
 */
function initEmployeesPage() {
    const searchInput = document.getElementById('employee-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const retryBtn = document.getElementById('retry-btn');

    // ძებნის ველის ივენთები
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            renderEmployees(employeesList);
            searchInput.focus();
        });
    }

    // შეცდომის დროს ხელახლა ცდის (Retry) ღილაკი
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            fetchEmployees();
        });
    }

    // მონაცემების პირველადი ჩატვირთვა
    fetchEmployees();
}

/**
 * API-დან თანამშრომლების წამოღება (Async/Await)
 */
async function fetchEmployees() {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const emptyState = document.getElementById('empty-state');
    const employeesGrid = document.getElementById('employees-grid');
    const searchContainer = document.getElementById('search-container');
    const resultsCount = document.getElementById('results-count');

    // მდგომარეობების საწყისი განულება (Loading ჩვენება)
    showElement(loadingState);
    hideElement(errorState);
    hideElement(emptyState);
    if (employeesGrid) employeesGrid.innerHTML = '';
    if (resultsCount) resultsCount.textContent = 'იტვირთება...';

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');

        // HTTP სტატუს კოდების დეტალური დამუშავება
        await handleHttpStatus(response);

        const data = await response.json();

        // მონაცემების შენახვა და გამოტანა
        employeesList = Array.isArray(data) ? data : [];
        hideElement(loadingState);

        if (searchContainer) {
            searchContainer.classList.remove('opacity-50', 'pointer-events-none');
        }

        renderEmployees(employeesList);
    } catch (error) {
        console.error('Fetch Employees Error:', error);
        hideElement(loadingState);
        displayError(error.message);
    }
}

/**
 * HTTP სტატუს კოდების ანალიზი და ვალიდაცია
 * @param {Response} response 
 */
async function handleHttpStatus(response) {
    if (response.ok && response.status === 200) {
        return; // წარმატებული 200 OK
    }

    let errorMessage = `სერვერის შეცდომა (სტატუსი: ${response.status})`;

    switch (response.status) {
        case 400:
            errorMessage = '400 — Bad Request: არასწორი მოთხოვნა სერვერზე.';
            break;
        case 404:
            errorMessage = '404 — Not Found: თანამშრომლების მონაცემები ვერ მოიძებნა.';
            break;
        case 500:
            errorMessage = '500 — Internal Server Error: სერვერის შიდა შეცდომა.';
            break;
        default:
            if (!response.ok) {
                errorMessage = `HTTP შეცდომა: ${response.status} ${response.statusText || 'უცნობი შეცდომა'}`;
            }
    }

    throw new Error(errorMessage);
}

/**
 * შეცდომის ბლოკის გამოჩენა
 * @param {string} message 
 */
function displayError(message) {
    const errorState = document.getElementById('error-state');
    const errorMessageEl = document.getElementById('error-message-text');
    const resultsCount = document.getElementById('results-count');

    if (errorMessageEl) {
        errorMessageEl.textContent = message || 'დაფიქსირდა მოულოდნელი შეცდომა მონაცემების წამოღებისას.';
    }
    if (resultsCount) {
        resultsCount.textContent = 'შეცდომა';
    }

    showElement(errorState);
}

/**
 * თანამშრომლების ბარათების რენდერინგი უსაფრთხო DOM მეთოდებით
 * @param {Array} employees 
 */
function renderEmployees(employees) {
    const employeesGrid = document.getElementById('employees-grid');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-count');

    if (!employeesGrid) return;

    employeesGrid.innerHTML = '';

    if (!employees || employees.length === 0) {
        showElement(emptyState);
        if (resultsCount) resultsCount.textContent = 'ნაპოვნია 0 თანამშრომელი';
        return;
    }

    hideElement(emptyState);
    if (resultsCount) {
        resultsCount.textContent = `სულ ნაპოვნია ${employees.length} თანამშრომელი`;
    }

    // თითოეული თანამშრომლის ბარათის შექმნა
    employees.forEach((user) => {
        const card = createEmployeeCard(user);
        employeesGrid.appendChild(card);
    });
}

/**
 * ერთი თანამშრომლის DOM ბარათის აწყობა უსაფრთხო DOM მეთოდებით
 * @param {Object} user 
 * @returns {HTMLElement}
 */
function createEmployeeCard(user) {
    const article = document.createElement('article');
    article.className = 'bg-slate-900/60 rounded-3xl p-6 sm:p-7 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between group shadow-xl relative overflow-hidden';

    // დეკორატიული hover glow
    const glowDiv = document.createElement('div');
    glowDiv.className = 'absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition duration-300 pointer-events-none';
    article.appendChild(glowDiv);

    // ზედა ნაწილი: ავატარი + სახელი + Username + ქალაქი
    const topContainer = document.createElement('div');
    topContainer.className = 'space-y-4';

    const headerFlex = document.createElement('div');
    headerFlex.className = 'flex items-start justify-between gap-3';

    // ავატარის იმიტაცია ინიციალებით
    const avatar = document.createElement('div');
    avatar.className = 'w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-blue-600/30 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition shadow-inner';
    const initials = (user.name || 'User')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    avatar.textContent = initials;

    // ქალაქის ბეიჯი
    const cityBadge = document.createElement('span');
    cityBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/80';
    const cityIcon = document.createElement('i');
    cityIcon.className = 'fa-solid fa-location-dot text-rose-400 text-[10px]';
    const cityText = document.createTextNode(` ${user.address?.city || 'უცნობია'}`);
    cityBadge.appendChild(cityIcon);
    cityBadge.appendChild(cityText);

    headerFlex.appendChild(avatar);
    headerFlex.appendChild(cityBadge);
    topContainer.appendChild(headerFlex);

    // სახელი და გვარი & Username
    const titleBox = document.createElement('div');
    titleBox.className = 'space-y-1';

    const nameEl = document.createElement('h3');
    nameEl.className = 'text-xl font-bold text-white group-hover:text-purple-300 transition break-words';
    nameEl.textContent = user.name || 'უცნობი თანამშრომელი';

    const usernameEl = document.createElement('p');
    usernameEl.className = 'text-xs text-purple-400 font-mono flex items-center gap-1';
    usernameEl.textContent = `@${user.username || 'username'}`;

    titleBox.appendChild(nameEl);
    titleBox.appendChild(usernameEl);
    topContainer.appendChild(titleBox);

    // დეტალური ინფორმაციის სია (Company, Email, Phone, Website)
    const dl = document.createElement('dl');
    dl.className = 'space-y-2.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300';

    // 1. კომპანია
    dl.appendChild(createInfoRow(
        'fa-regular fa-building text-blue-400',
        'კომპანია',
        user.company?.name || 'ინდივიდუალური'
    ));

    // 2. Email
    const emailRow = createInfoLinkRow(
        'fa-regular fa-envelope text-purple-400',
        'ელფოსტა',
        user.email || 'უცნობია',
        user.email ? `mailto:${user.email}` : null
    );
    dl.appendChild(emailRow);

    // 3. ტელეფონი
    const phoneRow = createInfoLinkRow(
        'fa-solid fa-phone text-emerald-400',
        'ტელეფონი',
        user.phone || 'უცნობია',
        user.phone ? `tel:${user.phone}` : null
    );
    dl.appendChild(phoneRow);

    // 4. ვებსაიტი
    const websiteUrl = user.website 
        ? (user.website.startsWith('http') ? user.website : `https://${user.website}`) 
        : null;
    const websiteRow = createInfoLinkRow(
        'fa-solid fa-globe text-indigo-400',
        'ვებსაიტი',
        user.website || 'უცნობია',
        websiteUrl,
        true
    );
    dl.appendChild(websiteRow);

    topContainer.appendChild(dl);
    article.appendChild(topContainer);

    // ქვედა footer ნაწილი ბარათისთვის
    const cardFooter = document.createElement('div');
    cardFooter.className = 'pt-4 border-t border-slate-800/80 mt-5 flex items-center justify-between text-xs text-slate-400';

    const idSpan = document.createElement('span');
    idSpan.className = 'font-mono text-slate-500';
    idSpan.textContent = `User ID: #${user.id}`;

    const contactLink = document.createElement('a');
    contactLink.href = user.email ? `mailto:${user.email}` : '#';
    contactLink.className = 'text-xs font-semibold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 transition';
    contactLink.textContent = 'დაკავშირება ';
    const arrowIcon = document.createElement('i');
    arrowIcon.className = 'fa-solid fa-arrow-right text-[10px]';
    contactLink.appendChild(arrowIcon);

    cardFooter.appendChild(idSpan);
    cardFooter.appendChild(contactLink);
    article.appendChild(cardFooter);

    return article;
}

/**
 * ტექსტური მონაცემის რიგის შექმნა
 */
function createInfoRow(iconClass, label, value) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2.5';

    const icon = document.createElement('i');
    icon.className = `${iconClass} w-4 text-center shrink-0`;

    const spanLabel = document.createElement('span');
    spanLabel.className = 'text-slate-400 shrink-0';
    spanLabel.textContent = `${label}:`;

    const spanVal = document.createElement('span');
    spanVal.className = 'text-slate-200 font-medium truncate';
    spanVal.textContent = value;

    div.appendChild(icon);
    div.appendChild(spanLabel);
    div.appendChild(spanVal);
    return div;
}

/**
 * ბმულიანი მონაცემის რიგის შექმნა (Email, Phone, Website)
 */
function createInfoLinkRow(iconClass, label, text, href, openNewTab = false) {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2.5';

    const icon = document.createElement('i');
    icon.className = `${iconClass} w-4 text-center shrink-0`;

    const spanLabel = document.createElement('span');
    spanLabel.className = 'text-slate-400 shrink-0';
    spanLabel.textContent = `${label}:`;

    div.appendChild(icon);
    div.appendChild(spanLabel);

    if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.className = 'text-slate-200 hover:text-purple-300 font-medium truncate underline-offset-2 hover:underline transition';
        link.textContent = text;
        if (openNewTab) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        div.appendChild(link);
    } else {
        const spanVal = document.createElement('span');
        spanVal.className = 'text-slate-200 font-medium truncate';
        spanVal.textContent = text;
        div.appendChild(spanVal);
    }

    return div;
}

/**
 * საძიებო ველის დამუშავება (Filter by Name or Username)
 */
function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    const clearBtn = document.getElementById('clear-search-btn');

    if (clearBtn) {
        if (searchTerm.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    if (!searchTerm) {
        renderEmployees(employeesList);
        return;
    }

    const filtered = employeesList.filter((user) => {
        const nameMatch = (user.name || '').toLowerCase().includes(searchTerm);
        const usernameMatch = (user.username || '').toLowerCase().includes(searchTerm);
        return nameMatch || usernameMatch;
    });

    renderEmployees(filtered);
}

function showElement(el) {
    if (el) el.classList.remove('hidden');
}

function hideElement(el) {
    if (el) el.classList.add('hidden');
}

