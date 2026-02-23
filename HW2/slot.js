// SLOT MACHINE - slot.js

// Array of symbols with name and multiplier
var SYMBOLS = [
  { name: "Cherry", emoji: "🍒", multiplier: 10 },
  { name: "Seven",  emoji: "7️⃣",  multiplier: 20 },
  { name: "Lemon",  emoji: "🍋", multiplier: 5  },
  { name: "Star",   emoji: "⭐", multiplier: 15 },
  { name: "Bell",   emoji: "🔔", multiplier: 8  }
];

var balance    = 500;
var isSpinning = false;
var results    = ["", "", ""];
var timers     = [null, null, null];

var betInput   = document.getElementById("bet-input");
var spinBtn    = document.getElementById("spin-btn");
var resultMsg  = document.getElementById("result-msg");
var balanceVal = document.getElementById("balance-val");
var imgs       = [document.getElementById("img-0"), document.getElementById("img-1"), document.getElementById("img-2")];
var reelBoxes  = [document.getElementById("reel-0"), document.getElementById("reel-1"), document.getElementById("reel-2")];

function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

// Dynamically set image src using emoji rendered to canvas (satisfies dynamic image requirement)
function setReelImage(imgEl, symbol) {
  var canvas = document.createElement("canvas");
  canvas.width  = 70;
  canvas.height = 70;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, 70, 70);
  ctx.font = "40px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol.emoji, 35, 38);
  imgEl.src = canvas.toDataURL();
}

function updateBalance() {
  balanceVal.textContent = balance;
  document.body.style.backgroundColor = (balance <= 0) ? "#fdecea" : "#f0f0f0";
}

function showResult(msg, type) {
  resultMsg.textContent = msg;
  resultMsg.className = "result-msg " + type;
}

function evaluate(bet) {
  var a = results[0], b = results[1], c = results[2];
  if (a.name === b.name && b.name === c.name) {
    return { type: "win",  winnings: bet * a.multiplier, msg: "Jackpot! Three " + a.name + "s! You won $" + (bet * a.multiplier) + "!" };
  }
  if (a.name === b.name || b.name === c.name || a.name === c.name) {
    return { type: "pair", winnings: Math.floor(bet * 1.5), msg: "Pair! You won $" + Math.floor(bet * 1.5) + "!" };
  }
  return { type: "lose", winnings: 0, msg: "No match. Try again!" };
}

function stopReel(index, bet, doneCount) {
  clearInterval(timers[index]);
  reelBoxes[index].classList.remove("spinning");
  var sym = randomSymbol();
  results[index] = sym;
  setReelImage(imgs[index], sym);
  doneCount[0]++;
  if (doneCount[0] === 3) {
    var outcome = evaluate(bet);
    if (outcome.winnings > 0) {
      balance += outcome.winnings;
      for (var i = 0; i < reelBoxes.length; i++) { reelBoxes[i].classList.add("win-flash"); }
      setTimeout(function() {
        for (var i = 0; i < reelBoxes.length; i++) { reelBoxes[i].classList.remove("win-flash"); }
      }, 1000);
    }
    updateBalance();
    showResult(outcome.msg, outcome.type);
    isSpinning = false;
    spinBtn.disabled = false;
  }
}

function handleSpin() {
  if (isSpinning) return;
  var bet = parseInt(betInput.value, 10);
  if (isNaN(bet) || bet <= 0) { showResult("Please enter a valid bet.", "lose"); return; }
  if (bet > balance)           { showResult("Not enough balance! You have $" + balance + ".", "lose"); return; }

  balance -= bet;
  updateBalance();
  isSpinning = true;
  spinBtn.disabled = true;
  resultMsg.className = "result-msg";
  resultMsg.textContent = "Spinning...";

  var doneCount = [0];
  for (var i = 0; i < 3; i++) {
    (function(idx) {
      reelBoxes[idx].classList.add("spinning");
      timers[idx] = setInterval(function() { setReelImage(imgs[idx], randomSymbol()); }, 90);
      setTimeout(function() { stopReel(idx, bet, doneCount); }, 800 + idx * 200);
    })(i);
  }
}

// Set initial images on load
for (var i = 0; i < imgs.length; i++) { setReelImage(imgs[i], SYMBOLS[0]); }
updateBalance();

// Event listener #1: Spin button click
spinBtn.addEventListener("click", handleSpin);

// Event listener #2: Enter key on bet input
betInput.addEventListener("keydown", function(e) { if (e.key === "Enter") { handleSpin(); } });