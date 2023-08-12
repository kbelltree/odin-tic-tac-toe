const Player = (name, mark) => {
    const getName = () => name; 
    const getMark = () => mark; 
    return { getName, getMark };
}

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

    const _isWinningMove = (playerMark) => {
    
        for(const combination of WINNING_INDEX_COMBINATIONS){
            if (gameBoard[combination[0]] === playerMark && 
                gameBoard[combination[1]] === playerMark && 
                gameBoard[combination[2]] === playerMark) {
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

const DisplayController = (() => {
    "use strict";

    const _closeFormModal = () => {
        const modal = document.querySelector(".modal-start"); 
        modal.style.display = "none"; 
    }

    const handleFormEntry = (e) => {
        e.preventDefault();
        _closeFormModal();
    }
    
    const handleFormCancel = () => {
        _closeFormModal();
    }

    const getPlayerName = (inputId) => {
        const name = document.querySelector(`#${inputId}`).value;
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

    const getIndexNumber = (e) => {
        return e.currentTarget.dataset.index; 
    }

    const addSVGBackground = (index) => {
        const cell = document.querySelector(`.cell[data-index='${index}']`);
        const mark = GameBoard.getMarkToDisplay(index);
        mark === "X" ? cell.classList.add("x") : cell.classList.add("o");
    }

    const addHighLightColor = (indicesArray) => {
   
        indicesArray.forEach(index => {
            const cell = document.querySelector(`.cell[data-index='${index}']`)
            cell.classList.add("highlight");
        })
    }

    const displayGameOverCall = (string) => {
        const textBox = document.querySelector("#winner-call");
        textBox.textContent = string; 
    }

    const addCellListener = (method) => {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            cell.addEventListener("click", method, {once : true});
        });
    }

    const addButtonListener = (buttonId, method) => {
        const button = document.querySelector(`#${buttonId}`);
        button.addEventListener("click", method); 
    }

    const respondFormSubmit = (method) => {
        const form = document.querySelector("#form");
        form.addEventListener("submit", method);
    }

    const removeCellListener = (status, method) => {
        const cells = document.querySelectorAll(".cell");
        if (status) {
            cells.forEach(cell => {
                cell.removeEventListener("click", method);
            })
        }
    }
 
    return { handleFormEntry, handleFormCancel, getPlayerName, displayNames, displayMark, getIndexNumber, addSVGBackground, addHighLightColor, displayGameOverCall, addCellListener, addButtonListener, respondFormSubmit, removeCellListener }

})();

const GameController = (() => {
    "use strict";

    // Variables for obj created from Player  
    let playerX; 
    let playerO;

    // Variable for player obj
    let currentPlayer;

    // Variable for winner boolean 
    let isThereWinner; 

    const _initializePlayers = () => {
        const nameX = DisplayController.getPlayerName("name-x");
        const nameO = DisplayController.getPlayerName("name-o");

        playerX = Player((nameX.trim() === "") ? "X" : nameX, "X");
        playerO = Player((nameO.trim() === "") ? "O" : nameO, "O"); 
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

    const _resetGame = (e) => {
        DisplayController.handleFormEntry(e);
        isThereWinner = false; 
        GameBoard.resetBoard();
        _clearPlayers(); 
        _initializePlayers();
        DisplayController.displayNames(playerX.getName(), playerO.getName());
        currentPlayer = playerX;
    }

    const _advanceGame = (e) => {
        const playerMark = currentPlayer.getMark();
        const playerName = currentPlayer.getName();
        const indexNumber = parseInt(DisplayController.getIndexNumber(e), 10);
        const moveResult = GameBoard.makeMove(indexNumber, playerMark);
               
        DisplayController.displayMark(indexNumber);
        DisplayController.addSVGBackground(indexNumber);
        _updateGameStatus(moveResult);  
        _switchPlayerTurn();
        _callGameOver(playerName);
        DisplayController.removeCellListener(isThereWinner, _advanceGame);   
    }

    DisplayController.addButtonListener("cancel-btn", DisplayController.handleFormCancel);
    DisplayController.respondFormSubmit(_resetGame);
    DisplayController.addButtonListener("start-btn", _reloadPage);
    DisplayController.addCellListener(_advanceGame);
 
})(); 

