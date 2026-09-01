// Updated javascript to POST to backend API if available; fallback to localStorage on failure

document.addEventListener('DOMContentLoaded', function() {
    // existing helpers (escapeHtml etc.)
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Submit registration forms (used by huduma modal and jiandikishe)
    const regForms = document.querySelectorAll('[data-register-form]');
    regForms.forEach(function(form){
        form.addEventListener('submit', function(e){
            e.preventDefault();
            const data = {};
            new FormData(form).forEach((v,k) => data[k] = v);

            // try send to server
            fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify(data)
            }).then(r => r.json()).then(resp => {
                if(resp && resp.success){
                    // show success message if form has one
                    const success = form.querySelector('.form-success');
                    if(success){ success.textContent = 'Asante! Umejisajili.'; success.style.display='block'; }
                    form.reset();
                } else {
                    // fallback to localStorage
                    const key = 'departmentRegistrations';
                    const regs = JSON.parse(localStorage.getItem(key) || '[]');
                    regs.push({...data, timestamp: new Date().toISOString()});
                    localStorage.setItem(key, JSON.stringify(regs));
                    const success = form.querySelector('.form-success');
                    if(success){ success.textContent = 'Hifadhiwa kwa kivinjari (offline).'; success.style.display='block'; }
                    form.reset();
                }
            }).catch(err => {
                // fallback
                const key = 'departmentRegistrations';
                const regs = JSON.parse(localStorage.getItem(key) || '[]');
                regs.push({...data, timestamp: new Date().toISOString()});
                localStorage.setItem(key, JSON.stringify(regs));
                const success = form.querySelector('.form-success');
                if(success){ success.textContent = 'Hifadhiwa kwa kivinjari (offline).'; success.style.display='block'; }
                form.reset();
            });
        });
    });

    // Contact form submit -> /api/contact
    const contactForm = document.getElementById('contactForm');
    if(contactForm){
        contactForm.addEventListener('submit', function(e){
            e.preventDefault();
            const data = {};
            new FormData(contactForm).forEach((v,k) => data[k] = v);
            fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
            .then(r=>r.json()).then(resp=>{
                if(resp && resp.success){
                    document.getElementById('contactSuccess').style.display='block';
                    contactForm.reset();
                } else {
                    // fallback local
                    const msgs = JSON.parse(localStorage.getItem('contactMessages')||'[]'); msgs.push({...data,timestamp:new Date().toISOString()}); localStorage.setItem('contactMessages',JSON.stringify(msgs));
                    document.getElementById('contactSuccess').style.display='block'; contactForm.reset();
                }
            }).catch(err=>{ const msgs = JSON.parse(localStorage.getItem('contactMessages')||'[]'); msgs.push({...data,timestamp:new Date().toISOString()}); localStorage.setItem('contactMessages',JSON.stringify(msgs)); document.getElementById('contactSuccess').style.display='block'; contactForm.reset(); });
        });
    }

});
