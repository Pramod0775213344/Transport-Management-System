document.addEventListener('DOMContentLoaded', () => {


    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Remove 'visible' class to reset animation on scroll-out
                entry.target.classList.remove('visible');
            }
        });
    }, {
    });
    const aboutUs = document.querySelectorAll('.animation');
    aboutUs.forEach(element => {
        observer.observe(element);
    });

    const slideAnimations = document.querySelectorAll('.slideAnimation');
    slideAnimations.forEach(element => {
        observer.observe(element);
    });


    window.onscroll = function () { scrollFunction() };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementsByClassName("navbar").style.top = "0";
        } else {
            document.getElementsByClassName("navbar").style.top = "-50px";
        }
    }
});