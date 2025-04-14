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

// --- NORMALIZATION FUNCTION FOR ANSWERS ---
function normalizeAnswer(answer) {
    return answer
        .toLowerCase()
        .replace(/[^\w\s]/g, "")                   // remove punctuation
        .replace(/\b(the|a|an|some)\b/g, "")       // remove common fillers
        .trim();
}


// --- CHECK ANSWER LOGIC ---
const correctAnswers = ["silence"]; // Add more if needed

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
    }
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

    hint.style.display = isVisible ? 'none' : 'block';
    hintBtn.classList.toggle('active', !isVisible);
}

document.getElementById('hint-btn').addEventListener('click', showHint);