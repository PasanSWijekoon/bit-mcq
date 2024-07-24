// Select the toggle switch element for light/dark mode
const toggleSwitch = document.querySelector('.light-dark-switch input[type="checkbox"]');
// Ensure the start menu is visible
document.querySelector(".start-menu").classList.toggle("visible");

// Function to switch between light and dark modes
function switchMode(event) {
    if (event.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

// Add event listener to toggle switch to change the mode
toggleSwitch.addEventListener('change', switchMode, false);

const yearOptions = {
    "CommunicationSkillsI": ["EN2106_2020", "2022", "2023"],
    "DatabaseSystems": ["2020", "2021", "2022"],
    "FundamentalsofSoftwareEngineering": ["2019", "2020", "2021", "2022"],
    "MathematicsforComputingI": ["2018", "2019", "2020"],
    "WebApplicationDevelopmentI": ["2017", "2018", "2019", "2020", "2021"]
 
};

function populateYearButtons(years, prefix) {
    const yearChoicesDiv = document.getElementById('year-choices');
    yearChoicesDiv.innerHTML = ''; // Clear existing buttons

    years.forEach(year => {
        const button = document.createElement('button');
        button.id = `${year}`;
        button.className = 'quiz-type';

        const iconContainer = document.createElement('div');
        iconContainer.className = 'button-icon-container';
        const img = document.createElement('img');
        img.src = './assets/images/icon-accessibility.svg';
        img.alt = 'Accessibility icon';
        iconContainer.appendChild(img);

        button.appendChild(iconContainer);
        button.appendChild(document.createTextNode(`${year}`));
        yearChoicesDiv.appendChild(button);
    });

    var yearButtons = document.querySelectorAll(".quiz-type");
var yearType;

// Add click event listener to each quiz type button
for (var i = 0; i < yearButtons.length; i++) {
    yearButtons[i].addEventListener("click", function () {
        yearType = this.id; // Get the ID of the clicked button
        questionScreen(yearType); // Load questions for the selected quiz type
       
    });
}
}

// Select all quiz type buttons
var quizButtons = document.querySelectorAll(".semester-type");
var quizType;

// Add click event listener to each quiz type button
for (var i = 0; i < quizButtons.length; i++) {
    quizButtons[i].addEventListener("click", function () {
        quizType = this.id; // Get the ID of the clicked button

        showSelectYear(quizType) ;
    });
}


function showSelectYear(type) {
    
    document.querySelector(".start-menu").classList.toggle("visible");
   
    document.querySelector(".select-year").classList.toggle("visible");

          
    const years = yearOptions[type]; // Get the corresponding years
    if (years) {
        populateYearButtons(years, type.split('_')[0]); // Pass the prefix (e.g., 'Chapter1', 'Fullpaper1')
        //showSelectYear();
    }
}





// Function to handle the display of the question screen
function questionScreen(type) {
    document.querySelector(".select-year").classList.toggle("visible");
    setSubjectBars(type); // Update subject bars with selected quiz type
    document.querySelector(".question-screen").classList.toggle("visible");

    // Retrieve quiz data based on selection
    getQuiz(type);
}

// Function to set subject bars based on the selected quiz type
function setSubjectBars(type) {
    var bars = document.querySelectorAll(".curr-subject");
    for (let bar of bars) {
        bar.lastElementChild.innerHTML = type; // Update subject name

        // Set icon based on the quiz type
        if (type === "HTML") {
            bar.firstElementChild.firstElementChild.src = "./assets/images/icon-html.svg";
        } else if (type === "CSS") {
            bar.firstElementChild.firstElementChild.src = "./assets/images/icon-css.svg";
        } else if (type === "JavaScript") {
            bar.firstElementChild.firstElementChild.src = "./assets/images/icon-js.svg";
        } else {
            bar.firstElementChild.firstElementChild.src = "./assets/images/icon-accessibility.svg";
        }
        bar.style.visibility = "visible"; // Ensure visibility
    }
}

// Initialize quiz variables
var quizChosen;
var qCount = -1;
var totalQuestions;
var score = 0;
var submit = document.querySelector(".submit-answer");
var increment;

// Fetch quiz data and initialize quiz questions
async function getQuiz(type) {
    const response = await fetch('./data.json'); // Fetch quiz data from JSON file
    const data = await response.json(); // Parse JSON data

    // Find the quiz data for the selected type
    for (const quiz of data.quizzes) {
        if (quiz.title === type) {
            quizChosen = quiz;
            totalQuestions = quizChosen.questions.length;
            document.querySelector(".question-total").textContent = totalQuestions;
            increment = (1 / totalQuestions) * 100; // Calculate progress increment
        }
    }
    makeQuestions(quizChosen); // Generate questions for the quiz
}

// Function to create and display quiz questions
function makeQuestions(quizChoice) {
    qCount++;
    document.querySelector(".question-number").textContent = (qCount + 1);
    document.querySelector(".progress-bar.done").style.width = (increment * (qCount + 1)).toString() + "%";
    submit.textContent = "Submit";
    let options = document.querySelectorAll(".option");

    document.querySelector(".question").textContent = quizChoice.questions[qCount].question;

    // Clear previous options
    for (let option of options) {
        option.classList.remove("selected");
        option.classList.remove("invalid");
        option.classList.remove("correct");
        option.innerHTML = "";
    }

    // Set new options
    for (let i = 0; i < options.length; i++) {
        options[i].innerHTML = `<div class='option-box'>${String.fromCharCode(65 + i)}</div>`;
        options[i].append(quizChoice.questions[qCount].options[i]);
    }
}

// Add click event listener to each option
var options = document.querySelectorAll(".option");
for (let i = 0; i < options.length; i++) {
    options[i].addEventListener("click", function () {
        options[i].classList.toggle("selected");
        options[i].firstChild.classList.toggle("selected-box");
    });
}

// Add click event listener to the submit button
submit.addEventListener("click", function () {
    let selectedBoxes = document.querySelectorAll(".selected");
    let selectedAnswers = [];

    // Handle button text and actions
    if (submit.textContent === "Next Question") {
        makeQuestions(quizChosen); // Load the next question
        return;
    }
    if (submit.textContent === "See Results") {
        showQuizComplete(); // Show quiz completion screen
        return;
    }

    // Collect selected answers
    if (selectedBoxes.length > 0) {
        selectedBoxes.forEach(box => {
            let answerText = box.textContent.slice(1, box.textContent.length);
            selectedAnswers.push(answerText);

            box.classList.remove("selected");
            box.firstChild.classList.remove("selected-box");
        });
    } else {
        document.querySelector(".select-prompt").style.visibility = "visible"; // Prompt to select an answer
        return;
    }

    // Validate answers and update score
    let partialScore = validate(selectedAnswers);
    score += partialScore;

    // Update option styles based on correctness
    selectedBoxes.forEach(box => {
        let answerText = box.textContent.slice(1, box.textContent.length);
        if (quizChosen.questions[qCount].answer.includes(answerText)) {
            if (!box.classList.contains("correct")) {
                box.innerHTML += "<img class='correct-icon' src='./assets/images/icon-correct.svg'>";
            }
            box.classList.add("correct");
            box.firstChild.classList.add("correct-box");
        } else {
            if (!box.classList.contains("invalid")) {
                box.innerHTML += "<img class='invalid-icon' src='./assets/images/icon-incorrect.svg'>";
            }
            box.classList.add("invalid");
            box.firstChild.classList.add("invalid-box");
        }
    });

    revealAnswers(); // Reveal correct answers

    document.querySelector(".select-prompt").style.visibility = "hidden";

    // Update submit button text
    if (qCount >= (totalQuestions - 1)) {
        submit.textContent = "See Results";
    } else {
        submit.textContent = "Next Question";
    }
});

// Function to validate selected answers and calculate score
function validate(selected) {
    let question = quizChosen.questions[qCount];
    let correctAnswers = question.answer;
    let selectedCorrectAnswers = selected.filter(answer => correctAnswers.includes(answer));
    let selectedIncorrectAnswers = selected.filter(answer => !correctAnswers.includes(answer));

    let score = 0;

    // Check if the user selected all correct answers and no incorrect answers
    if (selectedCorrectAnswers.length === correctAnswers.length && selectedIncorrectAnswers.length === 0) {
        score = 1; // Full score
    } else {
        // Calculate partial score
        let correctCount = correctAnswers.length;
        let partialScore = (selectedCorrectAnswers.length / correctCount) * 0.20;

        // Ensure partial score does not exceed 1
        score = Math.min(partialScore, 1);
    }

    return score;
}

// Function to reveal correct answers and highlight options
function revealAnswers() {
    for (let option of options) {
        let text = option.textContent.slice(1, option.textContent.length);
        if (quizChosen.questions[qCount].answer.includes(text)) {
            if (!option.classList.contains("correct")) {
                option.classList.add("correct");
                option.firstChild.classList.add("correct-box");
                option.innerHTML += "<img class='correct-icon' src='./assets/images/icon-correct.svg'>";
            }
        } else {
            if (option.classList.contains("selected")) {
                if (!option.classList.contains("invalid")) {
                    option.classList.add("invalid");
                    option.firstChild.classList.add("invalid-box");
                    option.innerHTML += "<img class='invalid-icon' src='./assets/images/icon-incorrect.svg'>";
                }
            }
        }
    }
}

// Function to show the quiz completion screen
function showQuizComplete() {
    document.querySelector(".question-screen").classList.toggle("visible");
    document.querySelector(".quiz-complete").classList.toggle("visible");
    document.querySelector(".final-score").textContent = score.toFixed(2); // Display final score
    document.querySelector(".complete-question-total").textContent = totalQuestions; // Display total questions
}

// Add event listener to restart the quiz
document.querySelector(".restart").addEventListener("click", function () {
    document.querySelector(".quiz-complete").classList.toggle("visible");
    document.querySelector(".start-menu").classList.toggle("visible");
    document.querySelector(".curr-subject").style.visibility = "hidden"; // Hide subject bars
    qCount = -1;
    score = 0;
});
