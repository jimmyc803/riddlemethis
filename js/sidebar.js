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

document.getElementById("clear-data-btn").addEventListener("click", () => {
    const confirmClear = confirm("Are you sure you want to clear your progress?");
    if (!confirmClear) return;

    localStorage.removeItem("lives");
    localStorage.removeItem("streak");
    localStorage.removeItem("riddleDone");
    localStorage.removeItem("lastPlayed");
    localStorage.removeItem("lastAnswer");

    lives = 3;
    isGameOver = false;
    updateLives();

    document.getElementById("answer-input").value = "";
    document.getElementById("answer-input").disabled = false;
    document.getElementById("submit-btn").disabled = false;
    document.getElementById("result").textContent = "";
    document.getElementById("streak").textContent = "🔥 Streak: 0 day(s)";
    showModal("🔄 Progress Reset", "Your lives and streak have been reset!");
});
