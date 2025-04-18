let darkmode = localStorage.getItem('darkmode')
const themeSwitch = document.getElementById('theme-switch')

const enableDarkmode = () => {
    document.body.classList.add('darkmode')
    localStorage.setItem('darkmode', 'active')
}

const disableDarkmode = () => {
    document.body.classList.remove('darkmode')
    localStorage.setItem('darkmode', 'null')
}

if(darkmode == 'active') enableDarkmode()

themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode')
    darkmode != "active" ? enableDarkmode() : disableDarkmode()
} )

let lives = 3;

// --- NORMALIZATION FUNCTION FOR ANSWERS ---
function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/[^\w\s]/g, "")                   // remove punctuation
        .replace(/\b(the|a|an|some)\b/g, "")       // remove common fillers
        .trim();
}

// --- CHECK ANSWER LOGIC ---
const correctAnswers = ["river"]; // Add more if needed

function checkAnswer() {
    const userInput = document.getElementById("answer-input").value;
    const userAnswer = normalizeAnswer(userInput);
    const resultElement = document.getElementById("result");

    if (userAnswer === "") return;

    const isCorrect = correctAnswers.some(ans => userAnswer === ans || userAnswer === ans + "s");

    if (isCorrect) {
        resultElement.textContent = "✅ Correct! Well done!";
        resultElement.style.color = "green";
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
        alert("Game Over! You've lost all your lives.");
        document.getElementById("submit-btn").disabled = true; // Disable submit button
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
    if (event.key === "Enter") {
        checkAnswer();
    }
});

// --- HINT BUTTON LOGIC ---
function showHint() {
    const hint = document.getElementById('hint');
    const hintBtn = document.getElementById('hint-btn');
    const isVisible = hint.style.display === 'block';

    // Toggle visibility of the hint and change button state
    hint.style.display = isVisible ? 'none' : 'block';
    hintBtn.classList.toggle('active', !isVisible); // Toggles the active class based on visibility
}

document.getElementById('hint-btn').addEventListener('click', showHint);

// Initialize lives display
updateLives();
