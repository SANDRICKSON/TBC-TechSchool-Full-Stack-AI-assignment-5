/**
 * projects.js - ახალი პროექტის დამატების POST მოთხოვნის დამუშავება
 * API: POST https://jsonplaceholder.typicode.com/posts
 * ფუნქციონალი: Async/Await, HTTP status handling (201 Created, 200, 400, 404, 500),
 * უსაფრთხო DOM მანიპულაცია, Alert შეტყობინებები.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAddProjectForm();
});

function initAddProjectForm() {
    const form = document.getElementById('add-project-form');
    if (!form) return;

    form.addEventListener('submit', handleProjectSubmit);
}

/**
 * ფორმის გაგზავნის დამმუშავებელი
 * @param {Event} event 
 */
async function handleProjectSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const titleInput = document.getElementById('project-title');
    const descInput = document.getElementById('project-description');
    const userIdInput = document.getElementById('project-user-id');
    const submitBtn = document.getElementById('submit-project-btn');
    const btnSpinner = document.getElementById('submit-spinner');
    const btnText = document.getElementById('submit-btn-text');
    const alertBox = document.getElementById('project-alert');

    // ველების ვალიდაცია
    const title = titleInput ? titleInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';
    const userId = userIdInput ? userIdInput.value.trim() : '';

    if (!title || !description || !userId) {
        showProjectAlert('ყველა ველის შევსება სავალდებულოა!', 'error');
        return;
    }

    const numericUserId = Number(userId);
    if (isNaN(numericUserId) || numericUserId <= 0) {
        showProjectAlert('გთხოვთ მიუთითოთ ვალიდური User ID (დადებითი რიცხვი).', 'error');
        return;
    }

    // UI Loading მდგომარეობა
    setButtonLoading(true, submitBtn, btnSpinner, btnText);
    hideProjectAlert();

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                body: description,
                userId: numericUserId
            })
        });

        // HTTP სტატუს კოდების ანალიზი
        await handlePostHttpStatus(response);

        const data = await response.json();

        // წარმატებული პასუხი (201 Created)
        const successMessage = `პროექტი წარმატებით შეიქმნა! (HTTP ${response.status} Created) — მინიჭებული ID: #${data.id}`;
        showProjectAlert(successMessage, 'success');

        // მიღებული პასუხით ახალი პროექტის ბარათის შექმნა და სიაში ჩამატება
        addNewProjectCard(data);

        // ფორმის გასუფთავება
        form.reset();

        // ეკრანის მსუბუქი სქროლი ახლად დამატებულ ბარათთან
        const newCardSection = document.getElementById('created-projects-section');
        if (newCardSection) {
            newCardSection.classList.remove('hidden');
            newCardSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

    } catch (error) {
        console.error('Add Project Error:', error);
        showProjectAlert(error.message, 'error');
    } finally {
        setButtonLoading(false, submitBtn, btnSpinner, btnText);
    }
}

/**
 * POST HTTP სტატუსების დამუშავება
 * @param {Response} response 
 */
async function handlePostHttpStatus(response) {
    // 201 Created ან 200 OK
    if (response.ok && (response.status === 201 || response.status === 200)) {
        return;
    }

    let message = `მოთხოვნის შეცდომა (სტატუსი: ${response.status})`;

    switch (response.status) {
        case 400:
            message = '400 — Bad Request: სერვერმა ვერ დაამუშავა არასწორი მონაცემები.';
            break;
        case 404:
            message = '404 — Not Found: ენდპოინტი /posts ვერ მოიძებნა.';
            break;
        case 500:
            message = '500 — Internal Server Error: სერვერის შეცდომა მონაცემის შენახვისას.';
            break;
        default:
            if (!response.ok) {
                message = `HTTP შეცდომა: ${response.status} ${response.statusText || 'შეცდომა სერვერთან'}`;
            }
    }

    throw new Error(message);
}

/**
 * ახალი პროექტის ბარათის აწყობა და DOM-ში ჩასმა უსაფრთხო მეთოდებით
 * @param {Object} projectData 
 */
function addNewProjectCard(projectData) {
    const container = document.getElementById('created-projects-grid');
    const emptyNotice = document.getElementById('no-created-projects');

    if (!container) return;

    if (emptyNotice) {
        emptyNotice.classList.add('hidden');
    }

    // Article ელემენტის შექმნა
    const article = document.createElement('article');
    article.className = 'bg-gradient-to-b from-slate-900/90 to-purple-950/30 rounded-3xl p-6 sm:p-7 border-2 border-purple-500/50 shadow-2xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 animate-fadeIn';

    // Glow ეფექტი
    const glow = document.createElement('div');
    glow.className = 'absolute -top-10 -right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none';
    article.appendChild(glow);

    // შიგთავსის კონტეინერი
    const content = document.createElement('div');
    content.className = 'space-y-4';

    // ზედა ჰედერი: ID ბეიჯი და Mock სტატუსი
    const topBar = document.createElement('div');
    topBar.className = 'flex items-center justify-between gap-2 flex-wrap';

    const idBadge = document.createElement('span');
    idBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-600/30 text-purple-200 border border-purple-500/40 font-mono shadow-sm';
    const idIcon = document.createElement('i');
    idIcon.className = 'fa-solid fa-hashtag text-[10px]';
    idBadge.appendChild(idIcon);
    idBadge.appendChild(document.createTextNode(` ID: ${projectData.id}`));

    const mockNotice = document.createElement('span');
    mockNotice.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/30';
    const checkIcon = document.createElement('i');
    checkIcon.className = 'fa-solid fa-check text-[10px]';
    mockNotice.appendChild(checkIcon);
    mockNotice.appendChild(document.createTextNode(' POST 201 Created'));

    topBar.appendChild(idBadge);
    topBar.appendChild(mockNotice);
    content.appendChild(topBar);

    // სათაური
    const heading = document.createElement('h3');
    heading.className = 'text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition break-words';
    heading.textContent = projectData.title;
    content.appendChild(heading);

    // აღწერა
    const descriptionP = document.createElement('p');
    descriptionP.className = 'text-slate-300 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-line';
    descriptionP.textContent = projectData.body;
    content.appendChild(descriptionP);

    article.appendChild(content);

    // ქვედა ნაწილი: User ID და საინფორმაციო წარწერა
    const bottomBar = document.createElement('div');
    bottomBar.className = 'pt-4 border-t border-slate-800/80 mt-5 space-y-2';

    const metaRow = document.createElement('div');
    metaRow.className = 'flex items-center justify-between text-xs text-slate-400';

    const userSpan = document.createElement('span');
    userSpan.className = 'flex items-center gap-1.5';
    const userIcon = document.createElement('i');
    userIcon.className = 'fa-solid fa-user text-purple-400 text-xs';
    userSpan.appendChild(userIcon);
    userSpan.appendChild(document.createTextNode(`User ID: #${projectData.userId}`));

    const dateSpan = document.createElement('span');
    dateSpan.className = 'text-[11px] text-slate-500';
    dateSpan.textContent = 'მიმდინარე სესია';

    metaRow.appendChild(userSpan);
    metaRow.appendChild(dateSpan);
    bottomBar.appendChild(metaRow);

    const noteP = document.createElement('p');
    noteP.className = 'text-[11px] text-slate-500 italic';
    noteP.textContent = '* JSONPlaceholder სატესტო API-ა: მონაცემი დაგენერირდა POST მოთხოვნით და ნაჩვენებია მიმდინარე სესიაში.';
    bottomBar.appendChild(noteP);

    article.appendChild(bottomBar);

    // სიაში დამატება (დასაწყისში)
    container.prepend(article);
}

/**
 * Alert შეტყობინების ჩვენება
 * @param {string} message 
 * @param {'success'|'error'} type 
 */
function showProjectAlert(message, type = 'success') {
    const alertBox = document.getElementById('project-alert');
    const alertIcon = document.getElementById('project-alert-icon');
    const alertText = document.getElementById('project-alert-text');

    if (!alertBox || !alertText || !alertIcon) return;

    alertText.textContent = message;

    if (type === 'success') {
        alertBox.className = 'p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg';
        alertIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-base mt-0.5 shrink-0';
    } else {
        alertBox.className = 'p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg';
        alertIcon.className = 'fa-solid fa-circle-exclamation text-rose-400 text-base mt-0.5 shrink-0';
    }

    alertBox.classList.remove('hidden');
}

function hideProjectAlert() {
    const alertBox = document.getElementById('project-alert');
    if (alertBox) {
        alertBox.classList.add('hidden');
    }
}

/**
 * ღილაკის Loading მდგომარეობა
 */
function setButtonLoading(isLoading, button, spinner, textEl) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.classList.add('opacity-75', 'cursor-not-allowed');
        if (spinner) spinner.classList.remove('hidden');
        if (textEl) textEl.textContent = 'იგზავნება...';
    } else {
        button.disabled = false;
        button.classList.remove('opacity-75', 'cursor-not-allowed');
        if (spinner) spinner.classList.add('hidden');
        if (textEl) textEl.textContent = 'პროექტის დამატება';
    }
}

