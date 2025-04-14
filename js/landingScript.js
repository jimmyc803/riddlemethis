window.addEventListener('pageshow', () => {
    document.body.classList.remove('fade-out');
});


function fadeAndRedirect(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}
