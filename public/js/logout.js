// Shared logout handler used across pages
(function () {
    function ensureLogoutModal() {
        let modal = document.getElementById('logout-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'logout-confirm-modal';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">
                    <div class="modal-content" style="background:#fff;padding:20px;border-radius:6px;max-width:400px;width:90%;text-align:center;">
                        <p style="margin-bottom:16px;">Are you sure you want to log out?</p>
                        <div style="display:flex;gap:8px;justify-content:center;">
                            <button id="logout-confirm-yes" class="btn btn-danger">Yes, Log out</button>
                            <button id="logout-confirm-no" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        return modal;
    }

    function attachLogoutHandlers() {
        const modal = ensureLogoutModal();

        document.body.addEventListener('click', (ev) => {
            if (ev.target && ev.target.matches('a.logout, button.logout')) {
                ev.preventDefault();
                modal.style.display = 'block';
            }

            if (ev.target && ev.target.id === 'logout-confirm-no') {
                modal.style.display = 'none';
            }

            if (ev.target && ev.target.id === 'logout-confirm-yes') {
                // Clear auth info
                localStorage.removeItem('token');
                localStorage.removeItem('uid');
                localStorage.removeItem('fname');
                localStorage.removeItem('lname');
                localStorage.removeItem('username');
                modal.style.display = 'none';
                window.location.href = '../html/index.html';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachLogoutHandlers);
    } else {
        attachLogoutHandlers();
    }

    // Protect against browser back-button showing cached authenticated pages.
    // If the page is shown from bfcache or back navigation, check auth and redirect if logged out.
    window.addEventListener('pageshow', function (event) {
        const token = localStorage.getItem('token');
        const uid = localStorage.getItem('uid');
        if (!token || !uid) {
            // Force navigation to login/index page
            window.location.replace('../html/index.html');
        }
    });
})();
