document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Target all elements with .slideAnimation class
    const animatedElements = document.querySelectorAll('.slideAnimation');
    animatedElements.forEach(el => revealObserver.observe(el));

    // Navbar Scroll Effect
    const mainNav = document.getElementById('mainNav');
    const scrollUpBtn = document.getElementById('scrollUpBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            mainNav?.classList.add('scrolled');
            scrollUpBtn?.classList.add('visible');
        } else {
            mainNav?.classList.remove('scrolled');
            scrollUpBtn?.classList.remove('visible');
        }
    });

    // Handle Smooth Scrolling for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navHeight = mainNav ? mainNav.offsetHeight : 80;
                window.scrollTo({
                    top: targetElement.offsetTop - navHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
});