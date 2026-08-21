document.addEventListener('DOMContentLoaded', function() {
    const statBoxes = document.querySelectorAll('.stat-box');
    if (statBoxes.length) {
        statBoxes.forEach((box) => {
            box.addEventListener('click', () => {
                statBoxes.forEach((item) => {
                    const details = item.querySelector('.stat-details');
                    const isActive = item === box;
                    item.classList.toggle('is-active', isActive);
                    if (details) {
                        details.classList.toggle('hidden', !isActive);
                    }
                });
            });
        });
    }

    const regForm = document.getElementById('register-form');
    const resultDiv = document.getElementById('submit-result');
    const announceForm = document.getElementById('announce-form');
    const announceText = document.getElementById('announce-text');
    const annList = document.getElementById('announcements-list');
    const adminOpenBtn = document.getElementById('admin-open-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminPassword = document.getElementById('admin-password');
    const adminError = document.getElementById('admin-error');
    const adminCloseModal = document.getElementById('admin-close-modal');
    const adminPanel = document.getElementById('admin-panel');
    const adminStatus = document.getElementById('admin-status');
    const adminAnnounceForm = document.getElementById('admin-announce-form');
    const adminAnnouncementText = document.getElementById('admin-announcement-text');
    const clearAnnouncementsBtn = document.getElementById('clear-announcements');
    const errorFields = {
        fullname: document.getElementById('error-fullname'),
        email: document.getElementById('error-email'),
        phone: document.getElementById('error-phone'),
        ministry: document.getElementById('error-ministry')
    };

    let isAdmin = false;
    const ADMIN_PASSWORD = 'abc123';

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showFieldError(fieldName, message) {
        Object.values(errorFields).forEach(el => {
            if (el) el.textContent = '';
        });
        if (message && errorFields[fieldName]) {
            errorFields[fieldName].textContent = message;
        }
    }

    function setAdminStatus(message) {
        if (adminStatus) {
            adminStatus.textContent = message;
        }
    }

    function setAdminMode(enabled) {
        isAdmin = enabled;
        const adminSection = document.getElementById('admin');
        if (adminPanel) {
            adminPanel.classList.toggle('hidden', !enabled);
        }
        if (adminSection) {
            adminSection.classList.toggle('hidden', !enabled);
        }
        if (enabled) {
            setAdminStatus('Umeingia kama admini. Sehemu ya admini sasa inapatikana.');
            localStorage.setItem('abc-global-admin', 'true');
        } else {
            setAdminStatus('');
            localStorage.removeItem('abc-global-admin');
        }
    }

    function checkAdminSession() {
        if (localStorage.getItem('abc-global-admin') === 'true') {
            setAdminMode(true);
        }
    }

    function openAdminModal() {
        if (!adminLoginModal) return;
        if (adminError) adminError.textContent = '';
        if (adminPassword) adminPassword.value = '';
        adminLoginModal.classList.remove('hidden');
    }

    function closeAdminModal() {
        if (adminLoginModal) {
            adminLoginModal.classList.add('hidden');
        }
    }

    if (adminOpenBtn) {
        adminOpenBtn.addEventListener('click', openAdminModal);
    }
    if (adminCloseModal) {
        adminCloseModal.addEventListener('click', closeAdminModal);
    }
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!adminPassword) return;
            if (adminPassword.value === ADMIN_PASSWORD) {
                setAdminMode(true);
                closeAdminModal();
            } else if (adminError) {
                adminError.textContent = 'Password si sahihi. Jaribu tena.';
            }
        });
    }

    function validateRegistration() {
        if (!document.getElementById('fullname') || !document.getElementById('phone') || !document.getElementById('ministry')) {
            return true;
        }
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
        const phone = document.getElementById('phone').value.trim();
        const ministry = document.getElementById('ministry').value.trim();

        if (!fullname) {
            showFieldError('fullname', 'Tafadhali weka majina kamili.');
            return false;
        }
        if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            showFieldError('email', 'Barua pepe si sahihi.');
            return false;
        }
        if (!phone || !/^0\d{8,12}$/.test(phone.replace(/\s/g, ''))) {
            showFieldError('phone', 'Tafadhali ingiza namba ya simu sahihi. Mfano 0766731959.');
            return false;
        }
        if (!ministry) {
            showFieldError('ministry', 'Tafadhali elezea huduma unayotaka.');
            return false;
        }
        showFieldError();
        return true;
    }

    function createResultCard(data) {
        return `
            <div class="result-card">
                <h3>Asante, ${escapeHtml(data.fullname)}!</h3>
                <p><strong>Email:</strong> ${escapeHtml(data.email || 'N/A')}</p>
                <p><strong>Simu:</strong> ${escapeHtml(data.phone)}</p>
                <p><strong>Huduma:</strong> ${escapeHtml(data.ministry)}</p>
                <p><strong>Hali:</strong> ${escapeHtml(data.status)}</p>
            </div>
        `;
    }

    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateRegistration()) {
                return;
            }
            const data = {
                fullname: document.getElementById('fullname').value.trim(),
                email: document.getElementById('email') ? document.getElementById('email').value.trim() : '',
                phone: document.getElementById('phone').value.trim(),
                ministry: document.getElementById('ministry').value.trim(),
                status: document.getElementById('status') ? document.getElementById('status').value : 'mgeni'
            };
            if (resultDiv) {
                resultDiv.innerHTML = createResultCard(data);
                resultDiv.scrollIntoView({ behavior: 'smooth' });
            }
            regForm.reset();
        });
    }

    const readStorageList = (key) => {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch (error) {
            return [];
        }
    };

    const writeStorageList = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const directoryConfigs = [
        { formId: 'new-member-form', listId: 'members-list', storageKey: 'abc_members', fields: ['fullname', 'phone', 'role'] },
        { formId: 'offering-form', listId: 'offerings-list', storageKey: 'abc_offerings', fields: ['offering', 'amount', 'details'] },
        { formId: 'waters-form', listId: 'waters-list', storageKey: 'abc_waters', fields: ['name', 'phone', 'role'] },
        { formId: 'deacon-form', listId: 'deacons-list', storageKey: 'abc_deacons', fields: ['name', 'phone', 'role'] },
        { formId: 'media-form', listId: 'media-list', storageKey: 'abc_media', fields: ['name', 'phone', 'role'] },
        { formId: 'leaders-form', listId: 'leaders-list', storageKey: 'abc_leaders', fields: ['name', 'phone', 'role'] },
        { formId: 'protocol-form', listId: 'protocol-list', storageKey: 'abc_protocol', fields: ['name', 'phone', 'role'] },
        { formId: 'guest-form', listId: 'guests-list', storageKey: 'abc_guests', fields: ['fullname', 'phone', 'origin'] },
        { formId: 'other-form', listId: 'others-list', storageKey: 'abc_others', fields: ['name', 'phone', 'details'] }
    ];

    directoryConfigs.forEach(({ formId, listId, storageKey, fields }) => {
        const form = document.getElementById(formId);
        const list = document.getElementById(listId);
        if (!form || !list) return;

        const renderTable = () => {
            const items = readStorageList(storageKey);
            if (!items.length) {
                list.innerHTML = `
                    <tr>
                        <td colspan="${fields.length}">Hakuna taarifa bado.</td>
                    </tr>
                `;
                return;
            }

            list.innerHTML = items.map((item) => `
                <tr>
                    ${fields.map((field) => `<td>${escapeHtml(item[field] || '')}</td>`).join('')}
                </tr>
            `).join('');
        };

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const entry = {};
            for (const field of fields) {
                const value = form.querySelector(`[name="${field}"]`)?.value.trim();
                if (!value) {
                    setAdminStatus('Tafadhali jaza sehemu zote kabla ya kuhifadhi.');
                    return;
                }
                entry[field] = value;
            }

            const items = readStorageList(storageKey);
            items.unshift(entry);
            writeStorageList(storageKey, items);
            form.reset();
            renderTable();
            setAdminStatus('Taarifa imehifadhiwa kwa usalama.');
        });

        renderTable();
    });

    let announcements = [];
    try {
        announcements = readStorageList('announcements');
    } catch (error) {
        announcements = [];
    }

    function renderAnnouncements() {
        if (!annList) return;
        if (!announcements.length) {
            annList.innerHTML = '<li>Hakuna tangazo isipokuwa ongeze moja hapo chini.</li>';
            return;
        }
        annList.innerHTML = announcements.map((item, index) => `
            <li>
                <div class="ann-text">${escapeHtml(item.text)}</div>
                <div class="ann-date">${escapeHtml(item.date)}</div>
                ${isAdmin ? '<button class="btn admin-delete" data-index="' + index + '">Futa</button>' : ''}
            </li>
        `).join('');

        if (isAdmin) {
            document.querySelectorAll('.admin-delete').forEach((button) => {
                button.addEventListener('click', function() {
                    removeAnnouncement(Number(this.dataset.index));
                });
            });
        }
    }

    function removeAnnouncement(index) {
        if (!isAdmin) return;
        announcements.splice(index, 1);
        writeStorageList('announcements', announcements);
        renderAnnouncements();
    }

    if (announceForm && announceText) {
        announceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const text = announceText.value.trim();
            if (!text) return;
            announcements.unshift({ text, date: new Date().toLocaleString() });
            writeStorageList('announcements', announcements);
            announceText.value = '';
            renderAnnouncements();
        });
    }

    if (adminAnnounceForm && adminAnnouncementText) {
        adminAnnounceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!isAdmin) return;
            const text = adminAnnouncementText.value.trim();
            if (!text) return;
            announcements.unshift({ text: '[Admin] ' + text, date: new Date().toLocaleString() });
            writeStorageList('announcements', announcements);
            adminAnnouncementText.value = '';
            renderAnnouncements();
        });
    }

    if (clearAnnouncementsBtn) {
        clearAnnouncementsBtn.addEventListener('click', function() {
            if (!isAdmin) return;
            announcements = [];
            writeStorageList('announcements', announcements);
            renderAnnouncements();
            setAdminStatus('Matangazo yote yamefutwa.');
        });
    }

    renderAnnouncements();
    checkAdminSession();

});
