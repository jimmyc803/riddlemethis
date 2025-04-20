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
        .replace(/[^\w\s]/g, "")
        .replace(/\b(the|a|an|some)\b/g, "")
        .trim();
}

let correctAnswers = [];

// --- CHECK ANSWER LOGIC ---
function checkAnswer() {
    if (isGameOver) return;

    const userInput = document.getElementById("answer-input").value;
    const userAnswer = normalizeAnswer(userInput);
    const resultElement = document.getElementById("result");
    const today = getLocalDateString(); // ← use local date

    localStorage.setItem("lastAnswer", userInput);
    if (userAnswer === "") return;

    const isCorrect = correctAnswers.some(ans => userAnswer === ans || userAnswer === ans + "s");

    if (isCorrect) {
        resultElement.textContent = "✅ Correct! Well done!";
        resultElement.style.color = "green";
        showModal("🎉 Correct!", "You solved the riddle!");
        document.getElementById("submit-btn").disabled = true;
        document.getElementById("answer-input").disabled = true;
        isGameOver = true;

        updateStreak();
        localStorage.setItem("riddleDone", today);
    } else {
        resultElement.textContent = "❌ Incorrect. Try again!";
        resultElement.style.color = "red";
        wrongAnswer();
    }
}

// --- WRONG ANSWER ---
function wrongAnswer() {
    if (lives > 0) {
        lives--;
        localStorage.setItem("lives", lives);  // Save lives after wrong answer
        updateLives(); // Make sure to update the lives display
    }

    if (lives === 0) {
        isGameOver = true;
        showModal("😢 Game Over!", "You've lost all your lives.");
        document.getElementById("submit-btn").disabled = true;
        document.getElementById("answer-input").disabled = true;

        const today = getLocalDateString(); // ← use local date
        localStorage.setItem("riddleDone", today);
        updateStreak();
    }
}


function updateStreak() {
    const today = getLocalDateString();
    const lastPlayed = localStorage.getItem("lastPlayed");
    let streak = parseInt(localStorage.getItem("streak")) || 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedYesterday = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    if (lastPlayed === formattedYesterday) {
        streak++;
    } else {
        streak = 1;
    }

    localStorage.setItem("streak", streak);
    localStorage.setItem("lastPlayed", today);
    document.getElementById("streak").textContent = `🔥 Streak: ${streak} day(s)`;
}

// --- Update Streak Display ---
// Function to display the streak
function displayStreak() {
    const streak = parseInt(localStorage.getItem("streak")) || 0;
    document.getElementById("streak").textContent = `🔥 Streak: ${streak} day(s)`;
}

// Display streak on page load
window.addEventListener('load', displayStreak);

// Inside checkAnswer after updating streak
const streak = parseInt(localStorage.getItem("streak")) || 0;
document.getElementById("streak").textContent = `🔥 Streak: ${streak} day(s)`;


// --- UPDATE LIVES DISPLAY ---
function updateLives() {
    const heart = "❤️";
    const empty = "🖤";
    document.getElementById("lives").innerHTML =
        heart.repeat(lives) + empty.repeat(3 - lives);
}

// --- ENTER TO SUBMIT ---
document.getElementById("answer-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !isGameOver) {
        checkAnswer();
    }
});

// --- MODAL ---
function showModal(title, message) {
    const modal = document.getElementById("customModal");
    const modalContent = document.getElementById("customModalContent");

    modal.style.display = "flex";
    modalContent.style.animation = "none";
    void modalContent.offsetWidth;
    modalContent.style.animation = "scaleUp 0.3s ease-out forwards";

    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalMessage").textContent = message;
}

function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

// --- HINT BUTTON ---
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

// --- INIT ---
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
    let savedLives = parseInt(localStorage.getItem("lives"));
    lives = !isNaN(savedLives) && savedLives >= 0 ? savedLives : 3;

    // Reset lives only if it's a new day
    if (savedDate !== today) {
        lives = 3;
        isGameOver = false;
        localStorage.setItem("lives", lives);
        console.log("Lives reset to 3 due to new day.");
    }
    console.log("Lives after initDailyCheck:", lives);

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

                const lastAnswer = localStorage.getItem("lastAnswer");
                document.getElementById("answer-input").value = lastAnswer || "";
            } else {
                document.getElementById("submit-btn").disabled = false;
                document.getElementById("answer-input").disabled = false;
                document.getElementById("answer-input").value = "";
                document.getElementById("result").textContent = "";
                isGameOver = false;
            }

            updateLives();
        })
        .catch(error => {
            console.error("Error fetching riddle data:", error);
        });
})();


document.getElementById("submit-btn").addEventListener("click", checkAnswer);
