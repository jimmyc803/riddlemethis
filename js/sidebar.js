// JavaScript to toggle the sidebar
const sidebar = document.querySelector('.sidebar');
const openBtn = document.querySelector('.open-btn');
const closeBtn = document.querySelector('.close-btn');

// Open the sidebar
openBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    openBtn.style.opacity = '0'; // Hide the ☰ button immediately
    openBtn.style.visibility = 'hidden'; // Make sure it's not clickable
});

// Close the sidebar
closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    
    // Add a small delay (100ms) before showing the ☰ button again
    setTimeout(() => {
        openBtn.style.opacity = '1';
        openBtn.style.visibility = 'visible';
    }, 100);  // 100 milliseconds delay before making the ☰ button visible
});
