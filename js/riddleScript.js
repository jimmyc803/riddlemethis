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

// Set the correct answer to the riddle
const correctAnswer = "hole";

// Function to check the user's answer
function checkAnswer() {
    const userAnswer = document.getElementById("answer-input").value.toLowerCase().trim(); // Get and format the user's input
    const resultElement = document.getElementById("result");

    if (userAnswer === "") {
        return;
    }

    // Compare user's answer to the correct answer
    if (userAnswer.includes(correctAnswer)) {
        resultElement.textContent = "Correct! Well done!";
        resultElement.style.color = "green";  // Green color for correct answer
    } else {
        resultElement.textContent = "Incorrect. Try again!";
        resultElement.style.color = "red";  // Red color for incorrect answer
    }
}

// Add an event listener for the Enter key press
document.getElementById("answer-input").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        checkAnswer(); // Call checkAnswer when Enter is pressed
    }
});

// Function to show the hint
function showHint() {
    const hint = document.getElementById('hint');
    const hintBtn = document.getElementById('hint-btn');

    // Toggle the hint visibility
    const isVisible = hint.style.display === 'block';

    hint.style.display = isVisible ? 'none' : 'block'; // Toggle display
    hintBtn.classList.toggle('active', !isVisible);    // Add/remove 'active' class based on visibility
}

// Add event listener to the hint button
document.getElementById('hint-btn').addEventListener('click', showHint);
