window.addEventListener('pageshow', (event) => {
    // This handles when you go "back" to the page and prevents it from being hidden
    if (event.persisted) {
      document.body.classList.remove('slide-up');
    } else {
      // Also remove in case the page loads fresh
      document.body.classList.remove('slide-up');
    }
  });
  
  function slideAndRedirect(targetUrl) {
    document.body.classList.add("slide-up");
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 700);
  }
  