const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const playAgainstComputerToggle = document.getElementById('playAgainstComputer');
const difficultySelect = document.getElementById('difficulty');

let currentPlayer = 'X';  // You are X
let gameBoard = ['', '', '', '', '', '', '', '', '']; // Tracks game state
let gameActive = true;
let playAgainstComputer = true;  // Default: Play against the computer
let difficulty = 'easy';  // Default difficulty is easy

// Function to check for a winner
const checkWinner = () => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6],            // diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            gameActive = false;
            statusText.textContent = `${currentPlayer} Wins!`;
            return;
        }
    }

    if (!gameBoard.includes('')) {
        gameActive = false;
        statusText.textContent = 'It\'s a Draw!';
    }
};

// Function to handle cell click
const cellClick = (e) => {
    const index = e.target.getAttribute('data-index');

    if (gameBoard[index] || !gameActive || currentPlayer === 'O' && playAgainstComputer) {
        return; // Prevent marking an already filled cell or when it's the computer's turn
    }

    gameBoard[index] = currentPlayer;
    e.target.textContent = currentPlayer;

    checkWinner();

    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';  // Switch turn
        if (currentPlayer === 'O' && playAgainstComputer) {
            statusText.textContent = "Computer's Turn";
            setTimeout(computerMove, 500);  // Delay for the computer's move
        } else {
            statusText.textContent = "Your Turn";
        }
    }
};

// Function to make the computer's move (based on difficulty level)
const computerMove = () => {
    if (!gameActive) return;

    let move;
    if (difficulty === 'easy') {
        move = easyAI();  // Random move
    } else if (difficulty === 'medium') {
        move = mediumAI();  // Block or random move
    } else if (difficulty === 'hard') {
        move = hardAI();  // Minimax AI
    }

    gameBoard[move] = 'O';
    cells[move].textContent = 'O';

    checkWinner();

    if (gameActive) {
        currentPlayer = 'X';  // Now it's your turn
        statusText.textContent = "Your Turn";
    }
};

// Easy AI (Random move)
const easyAI = () => {
    let availableCells = gameBoard.map((value, index) => value === '' ? index : -1).filter(index => index !== -1);
    return availableCells[Math.floor(Math.random() * availableCells.length)];
};

// Medium AI (Block if needed, otherwise random move)
const mediumAI = () => {
    let availableCells = gameBoard.map((value, index) => value === '' ? index : -1).filter(index => index !== -1);

    // Check if the player can win on their next move, and block it
    for (let i = 0; i < availableCells.length; i++) {
        let index = availableCells[i];
        gameBoard[index] = 'X'; // Simulate the player's move
        if (checkImmediateWinner('X')) {
            gameBoard[index] = ''; // Undo the move
            return index; // Block player's winning move
        }
        gameBoard[index] = ''; // Undo the move
    }

    // Otherwise, return a random move
    return availableCells[Math.floor(Math.random() * availableCells.length)];
};

// Helper function to check if a player can win immediately
const checkImmediateWinner = (player) => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6],            // diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] === player && gameBoard[b] === player && !gameBoard[c]) return c;
        if (gameBoard[a] === player && gameBoard[c] === player && !gameBoard[b]) return b;
        if (gameBoard[b] === player && gameBoard[c] === player && !gameBoard[a]) return a;
    }
    return null;
};

// Hard AI (Minimax algorithm)
const hardAI = () => {
    const minimax = (board, depth, isMaximizing) => {
        const winner = checkGameWinner(board);
        if (winner === 'X') return -10;
        if (winner === 'O') return 10;
        if (!board.includes('')) return 0;

        let bestScore = isMaximizing ? -Infinity : Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = isMaximizing ? 'O' : 'X';
                let score = minimax(board, depth + 1, !isMaximizing);
                board[i] = '';  // Undo move
                bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
            }
        }
        return bestScore;
    };

    const checkGameWinner = (board) => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6],            // diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] === board[b] && board[b] === board[c] && board[a] !== '') return board[a];
        }
        return null;
    };

    let bestMove = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O'; // Try 'O' move
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = ''; // Undo move
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
};

// Add event listeners to each cell
cells.forEach(cell => {
    cell.addEventListener('click', cellClick);
});

// Toggle play mode (Human vs Human or Human vs Computer)
playAgainstComputerToggle.addEventListener('change', (event) => {
    playAgainstComputer = event.target.checked;
    if (!playAgainstComputer && currentPlayer === 'O') {
        currentPlayer = 'X'; // Switch to your turn if you disabled computer play
        statusText.textContent = "Your Turn";
    } else {
        statusText.textContent = "Your Turn";
    }
});

// Difficulty level change
difficultySelect.addEventListener('change', (event) => {
    difficulty = event.target.value;
    console.log('Difficulty set to:', difficulty);
});

// Reset game function
resetButton.addEventListener('click', () => {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    statusText.textContent = "Your Turn";
    cells.forEach(cell => cell.textContent = '');
});