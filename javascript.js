// Factory function for player's information 
const Player = (name, mark) => {
    const getName = () => name; 
    const getMark = () => mark; 
    return { getName, getMark };
}

// Module that controls gameBoard status
const GameBoard = (() => {
    "use strict";

    // Store players mark  
    let gameBoard;

    // Winning cell combinations 
    const WINNING_INDEX_COMBINATIONS = [
        [0, 1, 2], 
        [3, 4, 5], 
        [6, 7, 8], 
        [0, 3, 6], 
        [1, 4, 7], 
        [2, 5, 8], 
        [0, 4, 8], 
        [2, 4, 6]
    ]

    const MOVE_STATUS = {
        invalid: 0,
        continue: 1, 
        win: 2, 
    }

    // store winning combination array 
    let winningCombination; 

    const _generateEmptyBoard = () => {
        return [null, null, null, null, null, null, null, null, null]
    }

    const _pushCurrentMark = (index, playerMark) => {
        gameBoard[index] = playerMark;
    }

    // loop through WINNING_INDEX_COMBINATIONS[array] over gameBoard array to see if there is match 
    const _isWinningMove = (playerMark) => {
    
        for(const combination of WINNING_INDEX_COMBINATIONS){
            if (gameBoard[combination[0]] === playerMark && 
                gameBoard[combination[1]] === playerMark && 
                gameBoard[combination[2]] === playerMark) {
                   console.log("combo: " + gameBoard[combination[0]], gameBoard[combination[1]], gameBoard[combination[2]]);
                   winningCombination = combination;    
                   return true;        
            } 
        }
    }
    
    const resetBoard = () => {   
        gameBoard = _generateEmptyBoard();
        winningCombination = undefined; 
    }

    const makeMove = (index, playerMark) => {
        if (gameBoard[index] !== null) {
            return MOVE_STATUS.invalid; 
        } else {         
            _pushCurrentMark(index, playerMark);
            return _isWinningMove(playerMark) ? MOVE_STATUS.win : MOVE_STATUS.continue;  
        }       
    }

    const isAllMarked = () => {
        return gameBoard.indexOf(null) === -1;
    }

    const getWinningCombination = () => {
        return winningCombination; 
    }

    return { resetBoard, makeMove, isAllMarked, getWinningCombination };
})();

// Module to monitor all game flow 
const GameController = (() => {
    "use strict";

    // Variables for obj created from Player  
    let playerX; 
    let playerO;

    // Variable for player obj
    let currentPlayer;

    // Variable for winner boolean 
    let isThereWinner; 

    // create a method that calls Player factory fn and assign each to playerX, playerO variables
    const _initializePlayers = () => {
        const nameForX = prompt('Enter the name who goes first (X).');
        const nameForO = prompt('Enter the name who goes second (O).');

        // Edge Case: When Cancel button is clicked
        if (nameForX === null || nameForO === null) return;

        // Edge Case: When a player hit OK without input, assign "Anonymous"
        playerX = Player((nameForX.trim() === "") ? "Anonymous" : nameForX, "X");
        playerO = Player((nameForO.trim() === "") ? "Anonymous" : nameForO, "O");
    }

    const _getValidMove = (playerMark) => {
        let result 
        do { 
            let cellChoice = prompt('enter cell number from 0 - 8');
            if (cellChoice === null) {
                alert (`Your Turn is Aborted.`);
                break; 
            }

            result = GameBoard.makeMove(cellChoice, playerMark);

            if (result === 0) {
                alert(`The cell number is taken or out of range. Re-try with another cell number.`);
            }
           
        } while (result === 0);
        
        return result; 
    }

    const _switchPlayerTurn = () => {
        currentPlayer = (currentPlayer === playerX) ? playerO : playerX;
    }

    const _updateGameStatus = (number) => {
        isThereWinner = number === 2; 
    }

    const _callGameOver = (playerName) => {
        if (isThereWinner) {
        // TODO: add a method that shows replay button 
            alert(`${playerName} Win! Play Again?`);
            console.log(`Winning Combo: ${GameBoard.getWinningCombination()}`);  
            setTimeout(resetGame(), 5000);
        } else if (!isThereWinner && GameBoard.isAllMarked()) {
            alert(`It's a Tie! Play Again?`);
            setTimeout(resetGame(), 5000);
        }
    }

    const _clearPlayers = () => {
        playerX = undefined; 
        playerO = undefined; 
    }

    const resetGame = () => {
        isThereWinner = false; 
        GameBoard.resetBoard();
        _clearPlayers(); 
        _initializePlayers();
        currentPlayer = playerX;
        console.log("currentPlayer: " + currentPlayer);
    }

    const advanceGame = (currentPlayerObj) => {
        const playerMark = currentPlayerObj.getMark();
        const playerName = currentPlayerObj.getName();

        console.log(`Player Name: ${playerName} Mark: ${playerMark} `);

        const moveResult = _getValidMove(playerMark);
       
        console.log(`result: ${moveResult}`);
        
        _updateGameStatus(moveResult);  
        _switchPlayerTurn();

        console.log(`game over? ${isThereWinner}`);
        _callGameOver(playerName);     
    }
 
    return { resetGame, advanceGame, getPlayer: () => currentPlayer };
})(); 

// GameController.resetGame();
// GameController.advanceGame(gameController.getPlayer());
