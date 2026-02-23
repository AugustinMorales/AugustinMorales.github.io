// =============================================
// SLOT MACHINE - External JS (slot.js)
// =============================================

// ---- Array of symbols - each has a name, multiplier, and SVG image URL ----
const SYMBOLS = [
  {
    name: "Cherry", multiplier: 10,
    // Dynamically built SVG data URL (satisfies "at least one image displayed dynamically via JS")
    img: buildSVG("🍒", "#fff0f0")
  },
  {
    name: "Seven",  multiplier: 20,
    img: buildSVG("7️⃣", "#fff8f0")
  },
  {
    name: "Lemon",  multiplier: 5,
    img: buildSVG("🍋", "#fffff0")
  },
  {
    name: "Star",   multiplier: 15,
    img: buildSVG("⭐", "#fffff5")
  },
  {
    name: "Bell",   multiplier: 8,
    img: buildSVG("🔔", "#fff5e0")
  },
];

// Build a simple SVG data URL with an emoji centered on a colored background
function buildSVG(emoji, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70">
    <rect width="70" height="70" fill="${bg}" rx="6"/>
    <text x="35" y="50" font-size="38" text-anchor="middle">${emoji}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

// ---- Game state ----
let balance    = 500;
let isSpinning = false;

// ---- DOM references ----
const betInput   = document.getElementById("bet-input");
const spinBtn    = document.getElementById("spin-btn");
const resultMsg  = document.getElementById("result-msg");
const balanceVal = document.getElementById("balance-val");
const reelBoxes  = [
  document.getElementById("reel-0"),
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
];
const imgs = [
  document.getElementById("img-0"),
  document.getElementById("img-1"),
  document.getElementById("img-2"),
];

// Set initial images on page load
for (let i = 0; i < imgs.length; i++) {
  imgs[i].src = SYMBOLS[0].img;
}

// ---- Pick a random symbol ----
function randomSymbol() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

// ---- Spin one reel, resolve after delay ----
function spinReel(reelBox, imgEl, stagger) {
  return new Promise((resolve) => {
    setTimeout(() => {
      reelBox.classList.add("spinning");

      // Rapidly swap images during spin - uses setInterval (control structure)
      const interval = setInterval(() => {
        imgEl.src = randomSymbol().img;
      }, 90);

      setTimeout(() => {
        clearInterval(interval);
        reelBox.classList.remove("spinning");
        const result = randomSymbol();
        imgEl.src = result.img;  // dynamically sets image via JS
        resolve(result);
      }, 800 + stagger);

    }, stagger);
  });
}

// ---- Evaluate results ----
function evaluate(results, bet) {
  const [a, b, c] = results;

  // Control structure: if/else conditions
  if (a.name === b.name && b.name === c.name) {
    const winnings = bet * a.multiplier;
    return { type: "win", winnings, msg: `🎉 Jackpot! Three ${a.name}s! You won $${winnings}!` };
  }

  if (a.name === b.name || b.name === c.name || a.name === c.name) {
    const winnings = Math.floor(bet * 1.5);
    return { type: "pair", winnings, msg: `✨ Pair! You won $${winnings}!` };
  }

  return { type: "lose", winnings: 0, msg: `💸 No match. Try again!` };
}

// ---- Flash winning reels ----
function flashReels() {
  reelBoxes.forEach((box) => {
    box.classList.add("win-flash");
    setTimeout(() => box.classList.remove("win-flash"), 1000);
  });
}

// ---- Update balance display and page background color ----
function updateBalance() {
  balanceVal.textContent = balance;
  // Change page style via JS (satisfies "content and style change via code")
  if (balance <= 0) {
    document.body.style.backgroundColor = "#fdecea";
  } else {
    document.body.style.backgroundColor = "#f0f0f0";
  }
}

// ---- Main spin handler ----
async function handleSpin() {
  if (isSpinning) return;

  const bet = parseInt(betInput.value, 10);

  if (isNaN(bet) || bet <= 0) {
    showResult("⚠️ Please enter a valid bet amount.", "lose");
    return;
  }
  if (bet > balance) {
    showResult(`⚠️ Not enough balance! You have $${balance}.`, "lose");
    return;
  }

  balance -= bet;
  updateBalance();
  isSpinning = true;
  spinBtn.disabled = true;
  resultMsg.className = "result-msg";
  resultMsg.textContent = "Spinning...";

  // Spin all three reels concurrently with stagger
  const [r0, r1, r2] = await Promise.all([
    spinReel(reelBoxes[0], imgs[0], 0),
    spinReel(reelBoxes[1], imgs[1], 200),
    spinReel(reelBoxes[2], imgs[2], 400),
  ]);

  const outcome = evaluate([r0, r1, r2], bet);

  if (outcome.winnings > 0) {
    balance += outcome.winnings;
    flashReels();
  }

  updateBalance();
  showResult(outcome.msg, outcome.type);

  isSpinning = false;
  spinBtn.disabled = false;
}

// ---- Show result message ----
function showResult(msg, type) {
  resultMsg.textContent = msg;
  resultMsg.className = "result-msg " + type;
}

// ---- EVENT LISTENERS ----

// Event listener #1: click on Spin button
spinBtn.addEventListener("click", handleSpin);

// Event listener #2: pressing Enter in the bet input
betInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    handleSpin();
  }
});

// ---- Init ----
updateBalance();