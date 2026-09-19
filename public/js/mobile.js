// Simple mobile sidebar toggle logic
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('show-mobile');
        });
        
        // Hide sidebar on nav click in mobile
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('show-mobile');
                }
            });
        });
    }
});
