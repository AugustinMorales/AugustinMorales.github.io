// =============================================
// JAVASCRIPT QUIZ - quiz.js
// =============================================

// Image filenames for check/x icons displayed next to each answer
var CHECK_IMG = "check.png";
var X_IMG     = "x.png";

// ---- Q1 choices — will be randomized ----
var q1Choices = [
  { value: "var",   label: "var"   },
  { value: "let",   label: "let"   },
  { value: "const", label: "const" },
  { value: "define",label: "define"}
];

// ---- Q5 choices — will be randomized ----
var q5Choices = [
  { value: "==",  label: "==" },
  { value: "===", label: "===" },
  { value: "=",   label: "="  },
  { value: "!==", label: "!==" }
];

// ---- Shuffle an array in place (Fisher-Yates) ----
function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// ---- Build radio button groups from a choices array ----
function buildRadios(containerId, name, choices) {
  var container = document.getElementById(containerId);
  container.innerHTML = "";
  shuffle(choices);
  for (var i = 0; i < choices.length; i++) {
    var label = document.createElement("label");
    label.className = "option-label";

    var radio = document.createElement("input");
    radio.type  = "radio";
    radio.name  = name;
    radio.value = choices[i].value;

    label.appendChild(radio);
    label.appendChild(document.createTextNode(" " + choices[i].label));
    container.appendChild(label);
  }
}

// ---- Show feedback with image ----
function showFeedback(feedbackId, blockId, isCorrect, message) {
  var feedbackEl = document.getElementById(feedbackId);
  var blockEl    = document.getElementById(blockId);

  var img = document.createElement("img");
  img.src = isCorrect ? CHECK_IMG : X_IMG;
  img.alt = isCorrect ? "Correct" : "Incorrect";

  feedbackEl.innerHTML = "";
  feedbackEl.appendChild(img);
  feedbackEl.appendChild(document.createTextNode(" " + message));
  feedbackEl.className = "feedback " + (isCorrect ? "correct-msg" : "incorrect-msg");

  blockEl.classList.remove("correct", "incorrect");
  blockEl.classList.add(isCorrect ? "correct" : "incorrect");
}

// ---- localStorage: track times taken ----
function getTimesTaken() {
  var val = localStorage.getItem("quizTimesTaken");
  return val ? parseInt(val, 10) : 0;
}

function incrementTimesTaken() {
  var current = getTimesTaken();
  current += 1;
  localStorage.setItem("quizTimesTaken", current);
  return current;
}

function updateTimesDisplay() {
  var count = getTimesTaken();
  document.getElementById("times-count").textContent = count;
}

// ---- Grade the quiz ----
function gradeQuiz() {
  var score = 0;
  var allAnswered = true;

  // --- Q1: Radio — const ---
  var q1Val = "";
  var q1Radios = document.querySelectorAll('input[name="q1"]');
  for (var i = 0; i < q1Radios.length; i++) {
    if (q1Radios[i].checked) {
      q1Val = q1Radios[i].value;
      break;
    }
  }
  if (!q1Val) {
    allAnswered = false;
    showFeedback("q1-feedback", "q1-block", false, "Please select an answer.");
  } else {
    var q1Correct = (q1Val === "const");
    if (q1Correct) score += 20;
    showFeedback("q1-feedback", "q1-block", q1Correct,
      q1Correct ? "Correct! const cannot be reassigned." : "Incorrect. The answer is const.");
  }

  // --- Q2: Checkboxes — string, boolean, undefined (NOT character) ---
  var q2Checks = document.querySelectorAll('input[name="q2"]:checked');
  var q2Selected = [];
  for (var i = 0; i < q2Checks.length; i++) {
    q2Selected.push(q2Checks[i].value);
  }
  var q2Correct = (
    q2Selected.indexOf("string")    !== -1 &&
    q2Selected.indexOf("boolean")   !== -1 &&
    q2Selected.indexOf("undefined") !== -1 &&
    q2Selected.indexOf("character") === -1 &&
    q2Selected.length === 3
  );
  if (q2Selected.length === 0) {
    allAnswered = false;
    showFeedback("q2-feedback", "q2-block", false, "Please select at least one answer.");
  } else {
    if (q2Correct) score += 20;
    showFeedback("q2-feedback", "q2-block", q2Correct,
      q2Correct ? "Correct! String, Boolean, and Undefined are valid JS types."
                : "Incorrect. Select String, Boolean, and Undefined (not Character).");
  }

  // --- Q3: Select — "object" ---
  var q3Val = document.getElementById("q3-select").value;
  if (!q3Val) {
    allAnswered = false;
    showFeedback("q3-feedback", "q3-block", false, "Please choose an answer.");
  } else {
    var q3Correct = (q3Val === "object");
    if (q3Correct) score += 20;
    showFeedback("q3-feedback", "q3-block", q3Correct,
      q3Correct ? 'Correct! typeof null returns "object" — a known JS quirk.'
                : 'Incorrect. typeof null returns "object".');
  }

  // --- Q4: Text input — push ---
  var q4Val = document.getElementById("q4-input").value.trim().toLowerCase();
  if (!q4Val) {
    allAnswered = false;
    showFeedback("q4-feedback", "q4-block", false, "Please type an answer.");
  } else {
    var q4Correct = (q4Val === "push");
    if (q4Correct) score += 20;
    showFeedback("q4-feedback", "q4-block", q4Correct,
      q4Correct ? "Correct! Array.push() adds to the end."
                : "Incorrect. The answer is push.");
  }

  // --- Q5: Radio — === ---
  var q5Val = "";
  var q5Radios = document.querySelectorAll('input[name="q5"]');
  for (var i = 0; i < q5Radios.length; i++) {
    if (q5Radios[i].checked) {
      q5Val = q5Radios[i].value;
      break;
    }
  }
  if (!q5Val) {
    allAnswered = false;
    showFeedback("q5-feedback", "q5-block", false, "Please select an answer.");
  } else {
    var q5Correct = (q5Val === "===");
    if (q5Correct) score += 20;
    showFeedback("q5-feedback", "q5-block", q5Correct,
      q5Correct ? "Correct! === checks value AND type."
                : "Incorrect. Strict equality uses ===.");
  }

  // ---- Show results ----
  var resultsBox   = document.getElementById("results-box");
  var finalScore   = document.getElementById("final-score");
  var congratsMsg  = document.getElementById("congrats-msg");
  var resultsTimes = document.getElementById("results-times");

  finalScore.textContent = score;
  resultsBox.classList.remove("hidden");

  if (score > 80) {
    congratsMsg.classList.remove("hidden");
  } else {
    congratsMsg.classList.add("hidden");
  }

  // Increment and show times taken (localStorage)
  var times = incrementTimesTaken();
  resultsTimes.textContent = times;
  updateTimesDisplay();

  // Disable submit, scroll to results
  document.getElementById("submit-btn").disabled = true;
  resultsBox.scrollIntoView({ behavior: "smooth" });
}

// ---- Reset quiz ----
function resetQuiz() {
  document.getElementById("quiz-form").reset();

  // Clear feedback
  var feedbacks = document.querySelectorAll(".feedback");
  for (var i = 0; i < feedbacks.length; i++) {
    feedbacks[i].innerHTML = "";
    feedbacks[i].className = "feedback";
  }

  // Clear block colors
  var blocks = document.querySelectorAll(".question-block");
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].classList.remove("correct", "incorrect");
  }

  document.getElementById("results-box").classList.add("hidden");
  document.getElementById("submit-btn").disabled = false;

  // Re-randomize radio choices
  buildRadios("q1-options", "q1", q1Choices.slice());
  buildRadios("q5-options", "q5", q5Choices.slice());

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---- Init ----
buildRadios("q1-options", "q1", q1Choices.slice());
buildRadios("q5-options", "q5", q5Choices.slice());
updateTimesDisplay();

document.getElementById("submit-btn").addEventListener("click", gradeQuiz);
document.getElementById("reset-btn").addEventListener("click", resetQuiz);