const questionArea = document.getElementById("quiz-prompt");
const inputArea = document.getElementById("quiz-input");
const button = document.getElementById("quiz-button");

let questionCounter = 0;
let mistakeCounter = 0;
let questions = [];
let solutions = [];

button.addEventListener("click", checkInput);

window.addEventListener("load", () => {
  // get quiz data from the html
  let questionsSolutionsPair =
    questionArea.dataset.questionsAndSolutions.split("|");

  // split pairs into components
  for (let i = 0; i < questionsSolutionsPair.length; i++) {
    questions.push(questionsSolutionsPair[i].split(":")[0]);
    solutions.push(questionsSolutionsPair[i].split(":")[1].toLowerCase());
  }

  questionArea.textContent = questions[questionCounter];
});

function checkInput() {
  let input = inputArea.value.trim().toLowerCase();

  const buttonMemory = {
    text: button.textContent,
    clr: button.style.color,
    bgClr: button.style.backgroundColor,
  };

  // change style and counters
  if (input === solutions[questionCounter]) {
    questionCounter++;

    button.textContent = "Richtige Antwort";
    button.style.color = "rgb(var(--color-text-light))";
    button.style.backgroundColor = "rgb(var(--color-tertiary-dark))";
    questionArea.textContent = questions[questionCounter];
    inputArea.value = "";

    // end of quiz
    if (!questions[questionCounter]) {
      questionArea.textContent = `Das war's. Du hast ${mistakeCounter} Fehler gemacht.`;
    }
  } else {
    mistakeCounter++;

    button.textContent = "Versuch es nochmal";
    button.style.color = "rgb(var(--color-text-light))";
    button.style.backgroundColor = "rgb(var(--color-primary-dark))";
  }

  // reset button content and style
  setTimeout(() => {
    button.textContent = buttonMemory.text;
    button.style.color = buttonMemory.clr;
    button.style.backgroundColor = buttonMemory.bgClr;
    alreadyFired = false;
  }, 1500);
}
