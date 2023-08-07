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

    const getMarkToDisplay = (index) => {
        return gameBoard[index];
    }

    const isAllMarked = () => {
        return gameBoard.indexOf(null) === -1;
    }

    const getWinningCombination = () => {
        return winningCombination;
    }

    return { resetBoard, makeMove, isAllMarked, getWinningCombination, getMarkToDisplay };
})();

// Module for UI 
const DisplayController = (() => {
    "use strict";

    const closeFormModal = (e) => {
        e.preventDefault();
        const modal = document.querySelector(".modal-start"); 
        modal.style.display = "none"; 
    }

    const getPlayerName = (inputId) => {
        const name = document.querySelector(`#${inputId}`).value;
        console.log(`nameDOM: ${name}`);
        // Edge Case: When a player hit enter without input, assign "Anonymous"
        return name; 
    }

    const displayNames = (nameForX, nameForO) => {
        const playerX = document.querySelector("#playerX");
        const playerO = document.querySelector("#playerO");
        playerX.textContent = nameForX; 
        playerO.textContent = nameForO; 
    }

    // method for displaying the latest entry of gameBoard array on click 
    const displayMark = (index) => {
        const cell = document.querySelector(`.cell[data-index='${index}']`);
        const hiddenValue = cell.querySelector(".hidden-value");
        hiddenValue.textContent = GameBoard.getMarkToDisplay(index);
    }

    // method for passing the index number the current player marked on click 
    const getIndexNumber = (e) => {
        return e.currentTarget.dataset.index; 
    }

    // method for adding svg imgs for X and O 
    const addSVGBackground = (index) => {
        const cell = document.querySelector(`.cell[data-index='${index}']`);
        const mark = GameBoard.getMarkToDisplay(index);
        mark === "X" ? cell.classList.add("x") : cell.classList.add("o");
    }

    const addHighLightColor = (indicesArray) => {
        // take winning array = GameBoard.getWinningCombination()
        indicesArray.forEach(index => {
            const cell = document.querySelector(`.cell[data-index='${index}']`)
            cell.classList.add("highlight");
        })
    }

    const displayGameOverCall = (string) => {
        const textBox = document.querySelector("#winner-call");
        textBox.textContent = string; 
    }

    // method for adding eventListener that is attached to all .cell class
    const addCellListener = (method) => {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.addEventListener("click", method, {once : true});
        });
    }

    // method for adding eventListener to buttons 
    const addButtonListener = (buttonId, method) => {
        const button = document.querySelector(`#${buttonId}`);
        button.addEventListener("click", method); 
    }

    const respondFormSubmit = (method) => {
        const form = document.querySelector("#form");
        form.addEventListener("submit", method);
    }

    // TODO: method for remove eventListener from cells after Game Over
    const removeCellListener = (status, method) => {
        const cells = document.querySelectorAll(".cell");
        if (status) {
            cells.forEach(cell => {
                cell.removeEventListener("click", method);
            })
        }
    }
 
    return { closeFormModal, getPlayerName, displayNames, displayMark, getIndexNumber, addSVGBackground, addHighLightColor, displayGameOverCall, addCellListener, addButtonListener, respondFormSubmit, removeCellListener }
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
        // TODO: save the name for both from DOM after submission in place of prompt 
        const nameX = DisplayController.getPlayerName("name-x");
        const nameO = DisplayController.getPlayerName("name-o");

        // Edge Case: if there is no entry add Anonymous
        playerX = Player((nameX.trim() === "") ? "Anonymous" : nameX, "X");
        playerO = Player((nameO.trim() === "") ? "Anonymous" : nameO, "O"); 

        // Edge Case: When Cancel button is clicked
        // if (nameForX === null || nameForO === null) return;
        
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
            DisplayController.displayGameOverCall(`${playerName} Win!`);
            DisplayController.addHighLightColor(GameBoard.getWinningCombination());
        } else if (!isThereWinner && GameBoard.isAllMarked()) {
            DisplayController.displayGameOverCall(`It's a Tie!`);
        }
    }

    const _reloadPage = () => {
        window.location.reload();
    }

    const _clearPlayers = () => {
        playerX = undefined; 
        playerO = undefined; 
    }

    const _resetGame = () => {
        isThereWinner = false; 
        GameBoard.resetBoard();
        _clearPlayers(); 
        _initializePlayers();
        DisplayController.displayNames(playerX.getName(), playerO.getName());
        currentPlayer = playerX;
        console.log("currentPlayer: " + currentPlayer);    
    }

    const _advanceGame = (e) => {
        console.log(`Event: ${e}`);
        const playerMark = currentPlayer.getMark();
        const playerName = currentPlayer.getName();
        const indexNumber = parseInt(DisplayController.getIndexNumber(e), 10);

        console.log(`Player Name: ${playerName} Mark: ${playerMark} `);

        // const moveResult = _getValidMove(playerMark);

        const moveResult = GameBoard.makeMove(indexNumber, playerMark);
       
        console.log(`result: ${moveResult}`);
        
        DisplayController.displayMark(indexNumber);
        DisplayController.addSVGBackground(indexNumber);
        _updateGameStatus(moveResult);  
        _switchPlayerTurn();

        console.log(`game over? ${isThereWinner}`);
        _callGameOver(playerName);
        DisplayController.removeCellListener(isThereWinner, _advanceGame);   
    }

    DisplayController.respondFormSubmit(DisplayController.closeFormModal);
    DisplayController.respondFormSubmit(_resetGame);
    DisplayController.addButtonListener("start-btn", _reloadPage);
    DisplayController.addCellListener(_advanceGame);
 
})(); 



// GameController.resetGame();
// GameController.advanceGame(gameController.getPlayer());
