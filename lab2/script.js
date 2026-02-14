// Game variables
let randomNumber;
let guesses = [];
let maxAttempts = 7;
let gamesWon = 0;
let gamesLost = 0;
let gameActive = true;

// Get DOM elements
const guessForm = document.getElementById('guessForm');
const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const resetButton = document.getElementById('resetButton');
const messageDiv = document.getElementById('message');
const guessesList = document.getElementById('guessesList');
const attemptsLeftSpan = document.getElementById('attemptsLeft');
const gamesWonSpan = document.getElementById('gamesWon');
const gamesLostSpan = document.getElementById('gamesLost');

// Initialize game
function initGame() {
    randomNumber = Math.floor(Math.random() * 99) + 1;
    guesses = [];
    gameActive = true;
    
    // Reset UI
    guessInput.value = '';
    guessInput.disabled = false;
    messageDiv.textContent = '';
    messageDiv.className = 'message';
    guessesList.innerHTML = '<p class="no-guesses">No guesses yet...</p>';
    attemptsLeftSpan.textContent = maxAttempts;
    
    // Show guess button, hide reset button
    guessButton.style.display = 'block';
    guessButton.disabled = false;
    resetButton.style.display = 'none';
    
    guessInput.focus();
}

// Update guesses display
function updateGuessesList() {
    if (guesses.length === 0) {
        guessesList.innerHTML = '<p class="no-guesses">No guesses yet...</p>';
    } else {
        guessesList.innerHTML = guesses
            .map(guess => `<span class="guess-item">${guess}</span>`)
            .join('');
    }
}

// Update stats display
function updateStats() {
    gamesWonSpan.textContent = gamesWon;
    gamesLostSpan.textContent = gamesLost;
    attemptsLeftSpan.textContent = maxAttempts - guesses.length;
}

// Display message
function displayMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
}

// End game
function endGame(won) {
    gameActive = false;
    guessInput.disabled = true;
    guessButton.disabled = true;
    guessButton.style.display = 'none';
    resetButton.style.display = 'block';
    
    if (won) {
        gamesWon++;
        displayMessage(`Congratulations! You guessed the number ${randomNumber} in ${guesses.length} attempt(s)!`, 'success');
    } else {
        gamesLost++;
        displayMessage(`You Lost! The number was ${randomNumber}`, 'lost');
    }
    
    updateStats();
}

// Handle guess submission
function handleGuess(e) {
    e.preventDefault();
    
    if (!gameActive) return;
    
    const guess = parseInt(guessInput.value);
    
    // Validation: Check if number is within range
    if (isNaN(guess) || guess < 1 || guess > 99) {
        displayMessage('Please enter a valid number between 1 and 99!', 'error');
        return;
    }
    
    // Check if number is higher than 99 (specific requirement)
    if (guess > 99) {
        displayMessage('Error: Number cannot be higher than 99!', 'error');
        return;
    }
    
    // Add guess to list
    guesses.push(guess);
    updateGuessesList();
    updateStats();
    
    // Clear input
    guessInput.value = '';
    
    // Check if guess is correct
    if (guess === randomNumber) {
        if (guesses.length <= maxAttempts) {
            endGame(true);
        }
        return;
    }
    
    // Check if max attempts reached
    if (guesses.length >= maxAttempts) {
        endGame(false);
        return;
    }
    
    // Provide feedback: high or low
    if (guess < randomNumber) {
        displayMessage(`${guess} is too LOW! Try a higher number.`, 'info');
    } else {
        displayMessage(`${guess} is too HIGH! Try a lower number.`, 'info');
    }
    
    guessInput.focus();
}

// Handle reset
function handleReset() {
    initGame();
}

// Event listeners
guessForm.addEventListener('submit', handleGuess);
resetButton.addEventListener('click', handleReset);

// Prevent typing values over 99
guessInput.addEventListener('input', function() {
    if (this.value > 99) {
        this.value = 99;
    }
    if (this.value < 1 && this.value !== '') {
        this.value = 1;
    }
});

// Initialize game on page load
initGame();
