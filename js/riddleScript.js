let lives = 3;
let isGameOver = false;

// --- DARK MODE TOGGLE ---
let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', 'null');
};

if (darkmode === 'active') enableDarkmode();

themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

// --- NORMALIZATION FUNCTION FOR ANSWERS ---
function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/[^\w\s]/g, "")                   // remove punctuation
        .replace(/\b(the|a|an|some)\b/g, "")       // remove common fillers
        .trim();
}

// --- CHECK ANSWER LOGIC ---
const correctAnswers = ["coffin"]; // Add more if needed

// --- CHECK ANSWER LOGIC ---
function checkAnswer() {
    if (isGameOver) return; // Prevent checking if game is over

    const userInput = document.getElementById("answer-input").value;
    const userAnswer = normalizeAnswer(userInput);
    const resultElement = document.getElementById("result");

    if (userAnswer === "") return;

    const isCorrect = correctAnswers.some(ans => userAnswer === ans || userAnswer === ans + "s");

    // --- STREAK LOGIC (runs once per day, no matter if correct or not) ---
    const today = getLocalDateString(); // local date string
    const alreadyAnsweredToday = localStorage.getItem("riddleDone") === today;

    if (!alreadyAnsweredToday) {
        const lastPlayed = localStorage.getItem("lastPlayed");
        let streak = parseInt(localStorage.getItem("streak")) || 0;
    
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const formattedYesterday = yesterday.toISOString().split("T")[0];
    
        if (lastPlayed === formattedYesterday) {
            streak++;
        } else {
            streak = 1;
        }
    
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastPlayed", today);
        localStorage.setItem("riddleDone", today);
        document.getElementById("streak").textContent = `🔥 Streak: ${streak} day(s)`;
    }

    if (isCorrect) {
        resultElement.textContent = "✅ Correct! Well done!";
        resultElement.style.color = "green";
        showModal("🎉 Correct!", "You solved the riddle!");
        document.getElementById("submit-btn").disabled = true;
        document.getElementById("answer-input").disabled = true;
        isGameOver = true;
    } else {
        resultElement.textContent = "❌ Incorrect. Try again!";
        resultElement.style.color = "red";
        wrongAnswer();
    }
}

// Function to handle losing a life
function wrongAnswer() {
    if (lives > 0) {
        lives--;
        updateLives();
    }
    if (lives === 0) {
        isGameOver = true;
        showModal("😢 Game Over!", "You've lost all your lives.");
        document.getElementById("submit-btn").disabled = true;
        document.getElementById("answer-input").disabled = true;
    }
}

// Function to update lives display
function updateLives() {
    const heart = "❤️";
    const empty = "🖤";
    document.getElementById("lives").innerHTML =
        heart.repeat(lives) + empty.repeat(3 - lives);
}

// Handle pressing Enter
document.getElementById("answer-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !isGameOver) {
        checkAnswer();
    }
});

// --- MODAL FUNCTIONS ---
function showModal(title, message) {
    const modal = document.getElementById("customModal");
    const modalContent = document.getElementById("customModalContent");

    modal.style.display = "flex";

    // Reset animation
    modalContent.style.animation = "none";
    void modalContent.offsetWidth; // Force reflow
    modalContent.style.animation = "scaleUp 0.3s ease-out forwards";

    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMessage").textContent = message;
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

// --- HINT BUTTON LOGIC ---
function showHint() {
    const hint = document.getElementById('hint');
    const hintBtn = document.getElementById('hint-btn');
    const isVisible = hint.style.display === 'block';

    if (isVisible) {
        hint.style.display = 'none';
        hintBtn.classList.remove('active');
    } else {
        hint.style.display = 'block';
        hintBtn.classList.add('active');
    }
}

document.getElementById('hint-btn').addEventListener('click', showHint);

// --- INITIALIZATION ON LOAD ---
updateLives();

function getLocalDateString() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localDate = new Date(now.getTime() - offset);
    return localDate.toISOString().split("T")[0];
}

(function initDailyCheck() {
    const today = getLocalDateString();
    const savedDate = localStorage.getItem("riddleDone");
    const streak = parseInt(localStorage.getItem("streak")) || 0;

    fetch('riddles.json')
        .then(response => response.json())
        .then(data => {
            const riddleData = data[today];

            if (riddleData) {
                document.getElementById("riddle-text").textContent = riddleData.riddle;
                document.getElementById("hint").textContent = `Hint: ${riddleData.hint}`;
                correctAnswers.length = 0;
                riddleData.answer.forEach(ans => correctAnswers.push(ans));
            } else {
                document.getElementById("riddle-text").textContent = "No riddle found for today. Come back tomorrow!";
                document.getElementById("hint").style.display = "none";
                document.getElementById("submit-btn").disabled = true;
                document.getElementById("answer-input").disabled = true;
                return;
            }

            if (savedDate === today) {
                document.getElementById("submit-btn").disabled = true;
                document.getElementById("answer-input").disabled = true;
                document.getElementById("result").textContent = "✅ Already completed today!";
                document.getElementById("result").style.color = "green";
                isGameOver = true;
            } else {
                document.getElementById("submit-btn").disabled = false;
                document.getElementById("answer-input").disabled = false;
                document.getElementById("answer-input").value = "";
                document.getElementById("result").textContent = "";
                isGameOver = false;
                lives = 3;
                updateLives();
            }

            document.getElementById("streak").textContent = `🔥 Streak: ${streak} day(s)`;
        })
        .catch(error => {
            console.error("Error fetching riddle data:", error);
        });
})();


document.getElementById("submit-btn").addEventListener("click", checkAnswer);

function simulateYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = yesterday.toISOString().split("T")[0];

    localStorage.setItem("lastPlayed", formattedYesterday);
    localStorage.removeItem("riddleDone");
    alert("Simulated yesterday's play. Refresh to test!");
}

