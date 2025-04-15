window.addEventListener('pageshow', () => {
    document.body.classList.remove('fade-out');
});

function slideAndRedirect(targetUrl) {
    document.body.classList.add("slide-up");
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 700); // duration matches CSS
}
