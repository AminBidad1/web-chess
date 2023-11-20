let curBoard;
let curPlayer;

let curHeldPiece;
let curHeldPieceStartingPosition;

let piecesScores = {
    "P": 1,
    "N": 3,
    "B": 3,
    "R": 5,
    "Q": 9,
    "p": 1,
    "n": 3,
    "b": 3,
    "r": 5,
    "q": 9
}

function startGame() {
    const starterPosition = [['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']];

    const starterPlayer = 'white';

    loadPosition(starterPosition, starterPlayer);
}

function loadPosition(position, playerToMove) {
    curBoard = position;
    curPlayer = playerToMove;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (position[i][j] != '.') {
                loadPiece(position[i][j], [i + 1, j + 1]);
            }
        }
    }
}

function loadPiece(piece, position) {
    const squareElement = document.getElementById(`${position[0]}${position[1]}`);

    const pieceElement = document.createElement('img');
    pieceElement.classList.add('piece');
    pieceElement.id = piece;
    pieceElement.draggable = false;
    pieceElement.src = getPieceImageSource(piece);

    squareElement.appendChild(pieceElement);
}

function getPieceImageSource(piece) {
    switch (piece) {
        case 'R': return 'assets/black_rook.png';
        case 'N': return 'assets/black_knight.png';
        case 'B': return 'assets/black_bishop.png';
        case 'Q': return 'assets/black_queen.png';
        case 'K': return 'assets/black_king.png';
        case 'P': return 'assets/black_pawn.png';
        case 'r': return 'assets/white_rook.png';
        case 'n': return 'assets/white_knight.png';
        case 'b': return 'assets/white_bishop.png';
        case 'q': return 'assets/white_queen.png';
        case 'k': return 'assets/white_king.png';
        case 'p': return 'assets/white_pawn.png';
    }
}

function setPieceHoldEvents() {
    let mouseX, mouseY = 0;

    document.addEventListener('mousemove', function(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    let pieces = document.getElementsByClassName('piece');
    let movePieceInterval;
    let hasIntervalStarted = false;

    for (const piece of pieces) {
        piece.addEventListener('mousedown', function(event) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        
            if (hasIntervalStarted === false) {
                piece.style.position = 'absolute';

                curHeldPiece = piece;
                const curHeldPieceStringPosition = piece.parentElement.id.split('');

                curHeldPieceStartingPosition = [parseInt(curHeldPieceStringPosition[0]) - 1, parseInt(curHeldPieceStringPosition[1]) - 1];

                movePieceInterval = setInterval(function() {
                    piece.style.top = mouseY - piece.offsetHeight / 2 + window.scrollY + 'px';
                    piece.style.left = mouseX - piece.offsetWidth / 2 + window.scrollX + 'px';
                }, 1);
        
                hasIntervalStarted = true;
            }
        });
    }
        
    document.addEventListener('mouseup', function(event) {
        window.clearInterval(movePieceInterval);

        if (curHeldPiece != null) {
            const boardElement = document.querySelector('.board');

            if ((event.clientX > boardElement.offsetLeft - window.scrollX && event.clientX < boardElement.offsetLeft + boardElement.offsetWidth - window.scrollX) &&
                (event.clientY > boardElement.offsetTop - window.scrollY && event.clientY < boardElement.offsetTop + boardElement.offsetHeight - window.scrollY)) {
                    const mousePositionOnBoardX = event.clientX - boardElement.offsetLeft + window.scrollX;
                    const mousePositionOnBoardY = event.clientY - boardElement.offsetTop + window.scrollY;

                    const boardBorderSize = parseInt(getComputedStyle(document.querySelector('.board'), null)
                                                .getPropertyValue('border-left-width')
                                                .split('px')[0]);

                    const xPosition = Math.floor((mousePositionOnBoardX - boardBorderSize) / document.getElementsByClassName('square')[0].offsetWidth);
                    const yPosition = Math.floor((mousePositionOnBoardY - boardBorderSize) / document.getElementsByClassName('square')[0].offsetHeight);

                    const pieceReleasePosition = [yPosition, xPosition];

                    if (!(pieceReleasePosition[0] == curHeldPieceStartingPosition[0] && pieceReleasePosition[1] == curHeldPieceStartingPosition[1])) {
                        if (validateMovement(curHeldPieceStartingPosition, pieceReleasePosition)) {
                            movePiece(curHeldPiece, curHeldPieceStartingPosition, pieceReleasePosition);
                        }
                    }
                }

            curHeldPiece.style.position = 'static';
            curHeldPiece = null;
            curHeldPieceStartingPosition = null;
        }
    
        hasIntervalStarted = false;
    });
}

function movePiece(piece, startingPosition, endingPosition) {
    // move validations to validateMovement()
    const boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    let alreadyPiece;
    if (boardPiece != '.') {
        if ((boardPiece === boardPiece.toUpperCase() && curPlayer == 'black') ||
            (boardPiece === boardPiece.toLowerCase() && curPlayer == 'white')) {
                alreadyPiece = curBoard[endingPosition[0]][endingPosition[1]];
                curBoard[startingPosition[0]][startingPosition[1]] = '.';
                score(endingPosition);
                endGame(endingPosition);
                curBoard[endingPosition[0]][endingPosition[1]] = boardPiece;
                if (isKish()){
                    curBoard[endingPosition[0]][endingPosition[1]] = alreadyPiece;
                    curBoard[startingPosition[0]][startingPosition[1]] = boardPiece;
                }
                else {
                    const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
                    destinationSquare.textContent = '';
                    destinationSquare.appendChild(piece);
                    
                    // check if is check/checkmate
                    if (curPlayer == 'white') {
                        curPlayer = 'black';
                    } else {
                        curPlayer = 'white';
                    }
                }
        }
    }
}

function validateMovement(startingPosition, endingPosition, kishCheck = false) {
    const boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    
    switch (boardPiece) {
        case 'r':
        case 'R': return validateRookMovement(startingPosition, endingPosition, kishCheck);
        case 'n':
        case 'N': return validateKnightMovement(startingPosition, endingPosition, kishCheck);
        case 'b':
        case 'B': return validateBishopMovement(startingPosition, endingPosition, kishCheck);
        case 'q':
        case 'Q': return validateQueenMovement(startingPosition, endingPosition, kishCheck);
        case 'k': 
        case 'K': return validateKingMovement(startingPosition, endingPosition, kishCheck);
        case 'p': return validatePawnMovement('white', startingPosition, endingPosition, kishCheck);
        case 'P': return validatePawnMovement('black', startingPosition, endingPosition, kishCheck);
    }
}

function validateBishopMovement(startingPosition, endingPosition, kishCheck = false) {
    if (endingPosition[0] - endingPosition[1] == startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] == startingPosition[0] + startingPosition[1]) {
            if (!validatePathIsBlocked(startingPosition, endingPosition, kishCheck)) {
                return false;
            }
            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validateRookMovement(startingPosition, endingPosition, kishCheck = false) {
    if (endingPosition[0] == startingPosition[0] || endingPosition[1] == startingPosition[1]) {
        if (!validatePathIsBlocked(startingPosition, endingPosition, kishCheck)) {
            return false;
        }
        // validate if move puts own king in check
        return true;
    } else {
        return false;
    }
}

function validateKingMovement(startingPosition, endingPosition, kishCheck = false) {
    if ([-1, 0, 1].includes(endingPosition[0] - startingPosition[0]) && [-1, 0, 1].includes(endingPosition[1] - startingPosition[1])) {
        if (isFriendlyPieceOnEndingPosition(endingPosition, kishCheck)) {
            return false;
        }
        // validate if move puts own king in check
        // validate castling
        return true;
    } else {
        return false;
    }
}

function validateQueenMovement(startingPosition, endingPosition, kishCheck = false) {
    if (endingPosition[0] - endingPosition[1] == startingPosition[0] - startingPosition[1] ||
        endingPosition[0] + endingPosition[1] == startingPosition[0] + startingPosition[1] ||
        endingPosition[0] == startingPosition[0] || endingPosition[1] == startingPosition[1]) {
            if (!validatePathIsBlocked(startingPosition, endingPosition, kishCheck)) {
                return false;
            }
            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validatePawnMovement(pawnColor, startingPosition, endingPosition, kishCheck = false) {
    direction = pawnColor == 'black' ? 1 : -1;

    let isCapture = false;

    if (endingPosition[0] == startingPosition[0] + direction &&
        [startingPosition[1] - 1, startingPosition[1] + 1].includes(endingPosition[1])) {
            // validate if is en passant
            if (isEnemyPieceOnEndingPosition(endingPosition, kishCheck)) {
                isCapture = true;
            }
        }

    // validate if is promotion
    let isFirstMove = false;

    if ((pawnColor == 'white' && startingPosition[0] == 6) || (pawnColor == 'black' && startingPosition[0] == 1)) {
        isFirstMove = true;
    }

    if (((endingPosition[0] == startingPosition[0] + direction || (endingPosition[0] == startingPosition[0] + direction * 2 && isFirstMove)) &&
         endingPosition[1] == startingPosition[1]) || isCapture) {
            if (isFriendlyPieceOnEndingPosition(endingPosition, kishCheck)) {
                return false;
            } else if (!isCapture && isEnemyPieceOnEndingPosition(endingPosition, kishCheck)) {
                return false;
            }

            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validateKnightMovement(startingPosition, endingPosition, kishCheck = false) {
    if (([-2, 2].includes(endingPosition[0] - startingPosition[0]) && [-1, 1].includes(endingPosition[1] - startingPosition[1])) || 
        ([-2, 2].includes(endingPosition[1] - startingPosition[1]) && [-1, 1].includes(endingPosition[0] - startingPosition[0]))) {
            if (isFriendlyPieceOnEndingPosition(endingPosition, kishCheck)) {
                return false;
            }
            // validate if move puts own king in check
            return true;
    } else {
        return false;
    }
}

function validatePathIsBlocked(startingPosition, endingPosition, kishCheck = false) {
    const xDifference = endingPosition[0] - startingPosition[0]
    const yDifference = endingPosition[1] - startingPosition[1]

    let xDirection = 0;
    let yDirection = 0;

    if (xDifference < 0) {
        xDirection = -1;
    } else if (xDifference > 0) {
        xDirection = 1;
    }

    if (yDifference < 0) {
        yDirection = -1;
    } else if (yDifference > 0) {
        yDirection = 1;
    }

    let squareX = startingPosition[0] + xDirection;
    let squareY = startingPosition[1] + yDirection;

    while (squareX != endingPosition[0] || squareY != endingPosition[1]) {
        const isSquareOccupied = document.getElementById(`${squareX + 1}${squareY + 1}`).children.length > 0;

        if (isSquareOccupied) {
            return false;
        }

        squareX += xDirection;
        squareY += yDirection;
    }
    
    if (isFriendlyPieceOnEndingPosition(endingPosition, kishCheck)) {
        return false;
    } else {
        // enemy piece has been captured
    }

    return true;
}

function isFriendlyPieceOnEndingPosition(endingPosition, kishCheck = false) {
    const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
    if (destinationSquare.children.length > 0) {
        const destinationPiece = destinationSquare.querySelector('.piece').id;
        const boardPiece = curBoard[endingPosition[0]][endingPosition[1]]
        if (!kishCheck){
            if (boardPiece == boardPiece.toUpperCase() && curPlayer == 'black' ||
                boardPiece == boardPiece.toLowerCase() && curPlayer == 'white') {
                    console.log(destinationPiece, curPlayer);
                    return true;
            } else {
                return false;
            }
        }
        else {
            if (boardPiece == boardPiece.toUpperCase() && curPlayer == 'black' ||
                boardPiece == boardPiece.toLowerCase() && curPlayer == 'white') {
                    console.log("yes");
                    return false;
            } else {
                return true;
            }
        }
    } else {
        return false;
    }
}

function isEnemyPieceOnEndingPosition(endingPosition, kishCheck = false) {
    const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);

    if (destinationSquare.children.length > 0) {
        const destinationPiece = destinationSquare.querySelector('.piece').id;
        const boardPiece = curBoard[endingPosition[0]][endingPosition[1]]
        if (!kishCheck){
            if (destinationPiece == destinationPiece.toUpperCase() && curPlayer == 'white' ||
                destinationPiece == destinationPiece.toLowerCase() && curPlayer == 'black') {
                    return true;
            } else {
                return false;
            }
        }
        else {
            if (destinationPiece == destinationPiece.toUpperCase() && curPlayer == 'white' ||
                destinationPiece == destinationPiece.toLowerCase() && curPlayer == 'black') {
                    return false;
            } else {
                return true;
            }
        }
    } else {
        return false;
    }
}


function score(endingPosition){
    let div_score;
    if (curPlayer == "white") {
        div_score = document.getElementById("white_score");
    }
    else {
        div_score = document.getElementById("black_score");
    }
    if (curBoard[endingPosition[0]][endingPosition[1]] != '.') {
        let enemyPiece = curBoard[endingPosition[0]][endingPosition[1]];
        if (enemyPiece in piecesScores){
            div_score.innerText = Number(div_score.innerText) + piecesScores[enemyPiece];
        }
    }
}


function endGame(endingPosition){
    if (curBoard[endingPosition[0]][endingPosition[1]] == 'k'){
        alert("Black Won!");
    }
    else if (curBoard[endingPosition[0]][endingPosition[1]] == 'K'){
        alert("White Won!");
    }
}


function isKish(){
    let king_position;
    let boardPiece;
    if (curPlayer == "white"){
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                if (curBoard[i][j] == 'k'){
                    king_position = [i, j];
                }
            }
        }
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                boardPiece = curBoard[i][j]
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toUpperCase()){
                        if (validateMovement([i, j], king_position, kishCheck=true)){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    else {
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                if (curBoard[i][j] == 'K'){
                    king_position = [i, j];
                }
            }
        }
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                boardPiece = curBoard[i][j]
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toLowerCase()){
                        if (validateMovement([i, j], king_position, kishCheck=true)){
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}


startGame();
setPieceHoldEvents();