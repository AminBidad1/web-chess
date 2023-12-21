let curBoard;
let curPlayer;

let curHeldPiece;
let curHeldPieceStartingPosition;
let playWithBot = false;
let numberMovesBot = 0;
let levelBot = 0;

let white_score = 0;
let black_score = 0;
let piecesThreatScores = {
    "P": 1,
    "N": 3,
    "B": 3,
    "R": 5,
    "Q": 9,
    "K": 10,
    "p": 1,
    "n": 3,
    "b": 3,
    "r": 5,
    "q": 9,
    "k": 10
}
let piecesKillScores = {
    "P": 10,
    "N": 30,
    "B": 30,
    "R": 50,
    "Q": 90,
    "K": 10000,
    "p": 10,
    "n": 30,
    "b": 30,
    "r": 50,
    "q": 90,
    "k": 10000,
}


function disablePageRefreshFacility() {
    let w,h=0;
    document.addEventListener('touchstart',function(e) {
        if(e.touches.length!=1) return;
        h=e.touches[0].clientY; w=window.pageYOffset===0;

        // testLabel is DOM element just to show the current pageYOffset - for test     
        testLabel.innerHTML=window.pageYOffset;
    },false);
    document.addEventListener('touchmove',function(e) {
        let y=e.touches[0].clientY,d=y-h; h=y;
        if(w) { w=0; if(d>0) return e.preventDefault(); }
        if(window.pageYOffset===0&&d>0) return e.preventDefault();
    },false);
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
    let touchX, touchY = 0;

    document.addEventListener('mousemove', function(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    document.addEventListener('touchmove', function(event) {
        touchX = event.touches[0].clientX;
        touchY = event.touches[0].clientY;
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
        piece.addEventListener('touchstart', function(event) {
            touchX = event.touches[0].clientX;
            touchY = event.touches[0].clientY;
        
            if (hasIntervalStarted === false) {
                piece.style.position = 'absolute';

                curHeldPiece = piece;
                const curHeldPieceStringPosition = piece.parentElement.id.split('');

                curHeldPieceStartingPosition = [parseInt(curHeldPieceStringPosition[0]) - 1, parseInt(curHeldPieceStringPosition[1]) - 1];

                movePieceInterval = setInterval(function() {
                    piece.style.top = touchY - piece.offsetHeight / 2 + window.scrollY + 'px';
                    piece.style.left = touchX - piece.offsetWidth / 2 + window.scrollX + 'px';
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
                            if (movePiece(curHeldPiece, curHeldPieceStartingPosition, pieceReleasePosition)){
                                if (playWithBot){
                                    play();
                                }
                            }
                        }
                    }
                }

            curHeldPiece.style.position = 'static';
            curHeldPiece = null;
            curHeldPieceStartingPosition = null;
        }
    
        hasIntervalStarted = false;
    });
    document.addEventListener('touchend', function(event) {
        window.clearInterval(movePieceInterval);

        if (curHeldPiece != null) {
            const boardElement = document.querySelector('.board');
            if ((touchX > boardElement.offsetLeft - window.scrollX && touchX < boardElement.offsetLeft + boardElement.offsetWidth - window.scrollX) &&
                (touchY > boardElement.offsetTop - window.scrollY && touchY < boardElement.offsetTop + boardElement.offsetHeight - window.scrollY)) {
                    const mousePositionOnBoardX = touchX - boardElement.offsetLeft + window.scrollX;
                    const mousePositionOnBoardY = touchY - boardElement.offsetTop + window.scrollY;

                    const boardBorderSize = parseInt(getComputedStyle(document.querySelector('.board'), null)
                                                .getPropertyValue('border-left-width')
                                                .split('px')[0]);

                    const xPosition = Math.floor((mousePositionOnBoardX - boardBorderSize) / document.getElementsByClassName('square')[0].offsetWidth);
                    const yPosition = Math.floor((mousePositionOnBoardY - boardBorderSize) / document.getElementsByClassName('square')[0].offsetHeight);

                    const pieceReleasePosition = [yPosition, xPosition];

                    if (!(pieceReleasePosition[0] == curHeldPieceStartingPosition[0] && pieceReleasePosition[1] == curHeldPieceStartingPosition[1])) {
                        if (validateMovement(curHeldPieceStartingPosition, pieceReleasePosition)) {
                            if (movePiece(curHeldPiece, curHeldPieceStartingPosition, pieceReleasePosition)){
                                if (playWithBot){
                                    play();
                                }
                            }
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
    let boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    let alreadyPiece;
    let isPawnPromotion = false;
    let isCastling = false;
    let castlingPosition;
    let backupPiece;
    let index;
    if (boardPiece != '.') {
        if ((boardPiece === boardPiece.toUpperCase() && curPlayer == 'black') ||
            (boardPiece === boardPiece.toLowerCase() && curPlayer == 'white')) {
                alreadyPiece = curBoard[endingPosition[0]][endingPosition[1]];
                curBoard[startingPosition[0]][startingPosition[1]] = '.';
                curBoard[endingPosition[0]][endingPosition[1]] = boardPiece;
                if (isKish()){
                    curBoard[endingPosition[0]][endingPosition[1]] = alreadyPiece;
                    curBoard[startingPosition[0]][startingPosition[1]] = boardPiece;
                    if (isCheckMate()){
                        if (curPlayer == "white"){
                            alert("Black Won!");
                        }
                        else {
                            alert("White Won!");
                        }
                    }
                    return false;
                }
                else {
                    const destinationSquare = document.getElementById(`${endingPosition[0] + 1}${endingPosition[1] + 1}`);
                    if (PawnPromotion(endingPosition)){
                        isPawnPromotion = true;
                        backupPiece = curBoard[endingPosition[0]][endingPosition[1]];
                    }
                    else if (['K', 'k'].includes(boardPiece) && [2, -2].includes(endingPosition[1] - startingPosition[1])){
                        curBoard[endingPosition[0]][endingPosition[1]] = alreadyPiece;
                        curBoard[startingPosition[0]][startingPosition[1]] = boardPiece;
                        castlingPosition = castling(startingPosition, endingPosition);
                        if (!castlingPosition){
                            return false;
                        }
                        else {
                            isCastling = true;
                            curBoard[startingPosition[0]][startingPosition[1]] = '.';
                            curBoard[endingPosition[0]][endingPosition[1]] = boardPiece;
                        }
                    }
                    setScore(checkThreats());
                    curBoard[endingPosition[0]][endingPosition[1]] = alreadyPiece;
                    curBoard[startingPosition[0]][startingPosition[1]] = boardPiece;
                    setScore(kill(endingPosition));
                    if (isPawnPromotion){
                        boardPiece = backupPiece;
                    }
                    curBoard[startingPosition[0]][startingPosition[1]] = '.';
                    curBoard[endingPosition[0]][endingPosition[1]] = boardPiece;
                    showScore();
                    index = `${startingPosition[0]}${startingPosition[1]}`;
                    if (index in boolIndexes){
                        boolIndexes[index] = false;
                    }
                    destinationSquare.textContent = '';
                    if (isPawnPromotion){
                        const startingSquare = document.getElementById(`${startingPosition[0] + 1}${startingPosition[1] + 1}`);
                        startingSquare.textContent = '';
                        addPiece(backupPiece, endingPosition);
                    }
                    else if (isCastling){
                        const startingSquare = document.getElementById(`${castlingPosition[0][0]+1}${castlingPosition[0][1]+1}`);
                        startingSquare.textContent = '';
                        addPiece(castlingPosition[2], castlingPosition[1]);
                        destinationSquare.appendChild(piece);
                    }
                    else {
                        destinationSquare.appendChild(piece);
                    }
                    // check if is check/checkmate
                    if (curPlayer == 'white') {
                        curPlayer = 'black';
                    } else {
                        curPlayer = 'white';
                    }
                    return true;
                }
        }
    }
}

function validateMovement(startingPosition, endingPosition, kishCheck = false) {
    try {
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
    catch(error) {
        console.log(error.message, error.lineNumber);
        return false;
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
    if (([-1, 0, 1].includes(endingPosition[0] - startingPosition[0]) &&
        [-1, 0, 1].includes(endingPosition[1] - startingPosition[1])) ||
        (endingPosition[0] == startingPosition[0] &&
        [-2, 2].includes(endingPosition[1] - startingPosition[1]))) {
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
    let boardPiece;
    if (!((startingPosition[0] + direction) in curBoard)){
        return false;
    }
    boardPiece = curBoard[startingPosition[0]+direction][startingPosition[1]];
    if (((endingPosition[0] == startingPosition[0] + direction || ((endingPosition[0] == startingPosition[0] + direction * 2 && isFirstMove) && boardPiece == '.')) &&
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
        const isOccupied = curBoard[squareX][squareY] != '.';
        if (isOccupied){
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
    const boardPiece = curBoard[endingPosition[0]][endingPosition[1]];
    if (boardPiece != '.'){
        if (!kishCheck){
            if (boardPiece == boardPiece.toUpperCase() && curPlayer == 'black' ||
                boardPiece == boardPiece.toLowerCase() && curPlayer == 'white') {
                    return true;
            } else {
                return false;
            }
        }
        else {
            if (boardPiece == boardPiece.toUpperCase() && curPlayer == 'black' ||
                boardPiece == boardPiece.toLowerCase() && curPlayer == 'white') {
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
    const boardPiece = curBoard[endingPosition[0]][endingPosition[1]];
    if (boardPiece != '.') {
        if (!kishCheck){
            if (boardPiece == boardPiece.toUpperCase() && curPlayer == 'white' ||
                boardPiece == boardPiece.toLowerCase() && curPlayer == 'black') {
                    return true;
            } else {
                return false;
            }
        }
        else {
            if (boardPiece == boardPiece.toUpperCase() && curPlayer == 'white' ||
                boardPiece == boardPiece.toLowerCase() && curPlayer == 'black') {
                    return false;
            } else {
                return true;
            }
        }
    } else {
        return false;
    }
}


function showScore(){
    let div_score;
    if (curPlayer == "white") {
        div_score = document.getElementById("white_score");
        div_score.innerText = white_score;
    }
    else {
        div_score = document.getElementById("black_score");
        div_score.innerText = black_score;
    } 
}

function kill(endingPosition){
    let enemyPiece = curBoard[endingPosition[0]][endingPosition[1]];
    if (enemyPiece != '.'){
        return piecesKillScores[enemyPiece];
    }
    else {
        return 0;
    }
}

function setScore(value){
    if (curPlayer == "white") {
        white_score += value;
    }
    else {
        black_score += value;
    }
}


function isCheckMate(){
    let boardPiece;
    let alreadyPiece;
    if (curPlayer == "white"){
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                boardPiece = curBoard[i][j];
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toLowerCase()){
                        for (let x=0; x<8; x+=1){
                            for (let y=0; y<8; y+=1){
                                if (x != i || y != j){
                                    if (validateMovement([i, j], [x, y])){
                                        alreadyPiece = curBoard[x][y];
                                        if (!(['K', 'k'].includes(boardPiece) &&
                                            [2, -2].includes(y - j) &&
                                            x == i && 
                                            ['k', 'K'].includes(alreadyPiece))){
                                                curBoard[i][j] = '.';
                                                curBoard[x][y] = boardPiece;
                                                if (
                                                    ['K', 'k'].includes(boardPiece) &&
                                                    [2, -2].includes(y - j) &&
                                                    x == i) {
                                                    curBoard[i][j] = boardPiece;
                                                    curBoard[x][y] = alreadyPiece;
                                                }
                                                else if (isKish()){
                                                    curBoard[i][j] = boardPiece;
                                                    curBoard[x][y] = alreadyPiece;
                                                }
                                                else {
                                                    curBoard[i][j] = boardPiece;
                                                    curBoard[x][y] = alreadyPiece;
                                                    return false;
                                                }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                boardPiece = curBoard[i][j];
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toUpperCase()){
                        for (let x=0; x<8; x+=1){
                            for (let y=0; y<8; y+=1){
                                if (x != i || y != j){
                                    if (validateMovement([i, j], [x, y])){
                                        alreadyPiece = curBoard[x][y];
                                        if (!(['K', 'k'].includes(boardPiece) &&
                                            [2, -2].includes(y - j) &&
                                            x == i && 
                                            ['k', 'K'].includes(alreadyPiece))){
                                            curBoard[i][j] = '.';
                                            curBoard[x][y] = boardPiece;
                                            if (
                                                ['K', 'k'].includes(boardPiece) &&
                                                [2, -2].includes(y - j) &&
                                                x == i) {
                                                curBoard[i][j] = boardPiece;
                                                curBoard[x][y] = alreadyPiece;
                                            }
                                            else if (isKish()){
                                                curBoard[i][j] = boardPiece;
                                                curBoard[x][y] = alreadyPiece;
                                            }
                                            else {
                                                curBoard[i][j] = boardPiece;
                                                curBoard[x][y] = alreadyPiece;
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
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
                boardPiece = curBoard[i][j];
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toUpperCase()){
                        if (validateMovement([i, j], king_position, kishCheck=true)){
                            if (!(['K', 'k'].includes(boardPiece) &&
                                [2, -2].includes(king_position[1] - j) &&
                                king_position[0] == i)){
                                return true;
                            }
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
                boardPiece = curBoard[i][j];
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toLowerCase()){
                        if (validateMovement([i, j], king_position, kishCheck=true)){
                            if (!(['K', 'k'].includes(boardPiece) &&
                                [2, -2].includes(king_position[1] - j) &&
                                king_position[0] == i)){
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}

function checkThreats(){
    let boardPiece;
    let enemyPiece;
    let white_new_moment_score = 0;
    let black_new_moment_score = 0;
    if (curPlayer == "white"){
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                boardPiece = curBoard[i][j];
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toLowerCase()){
                        for (let x=0; x<8; x+=1){
                            for (let y=0; y<8; y+=1){
                                enemyPiece = curBoard[x][y];
                                if (enemyPiece != "."){
                                    if (enemyPiece === enemyPiece.toUpperCase()){
                                        if (validateMovement([i, j], [x, y])){
                                            white_new_moment_score += piecesThreatScores[enemyPiece];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return white_new_moment_score;
    }
    else if (curPlayer == "black"){
        for (let i=0; i<8; i+=1){
            for (let j=0; j<8; j+=1){
                boardPiece = curBoard[i][j];
                if (boardPiece != "."){
                    if (boardPiece === boardPiece.toUpperCase()){
                        for (let x=0; x<8; x+=1){
                            for (let y=0; y<8; y+=1){
                                enemyPiece = curBoard[x][y];
                                if (enemyPiece != "."){
                                    if (enemyPiece === enemyPiece.toLowerCase()){
                                        if (validateMovement([i, j], [x, y])){
                                            black_new_moment_score += piecesThreatScores[enemyPiece];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return black_new_moment_score;
    }
}

function addPiece(piece, position){
    const squareElement = document.getElementById(`${position[0]+1}${position[1]+1}`);

    const pieceElement = document.createElement('img');
    pieceElement.classList.add('piece');
    pieceElement.id = piece;
    pieceElement.draggable = false;
    pieceElement.src = getPieceImageSource(piece);

    squareElement.appendChild(pieceElement);
    setPieceHoldEvents();
}

function PawnPromotion(endingPosition){
    let boardPiece = curBoard[endingPosition[0]][endingPosition[1]];
    let selectedPiece;
    let isValid = false;
    if (endingPosition[0] == 0 && boardPiece == 'p'){
        while (!isValid){
            isValid = true;
            selectedPiece = prompt("please select a piece:\nQueen\nRook\nBishop\nknight", "Queen");
            switch (selectedPiece) {
                case 'Queen':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'q';
                    break;
                case 'Rook':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'r';
                    break;
                case 'Bishop':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'b';
                    break;
                case 'Knight':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'n';
                    break;
                default:
                    isValid = false;
                    alert("please don't type spam");
                    break;
            }
        }
        return true;
    }
    else if (endingPosition[0] == 7 && boardPiece == 'P'){
        if (playWithBot){
            curBoard[endingPosition[0]][endingPosition[1]] = 'Q';
            return true;
        }
        while (!isValid){
            isValid = true;
            selectedPiece = prompt("please select a piece:\nQueen\nRook\nBishop\nknight", "Queen");
            switch (selectedPiece) {
                case 'Queen':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'Q';
                    break;
                case 'Rook':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'R';
                    break;
                case 'Bishop':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'B';
                    break;
                case 'Knight':
                    curBoard[endingPosition[0]][endingPosition[1]] = 'N';
                    break;
                default:
                    isValid = false;
                    alert("please don't type spam");
                    break;
            }
        }
        return true;
    }
    return false;
}

let boolIndexes = {
    "00": true,
    "07": true,
    "04": true,
    "70": true,
    "74": true,
    "77": true
}
let indexToIndex = {
    "04-2": [0, 3],
    "042": [0, 5],
    "74-2": [7, 3],
    "742": [7, 5]
}
let castlingValues = [
    ['K', '04', '07', 2, [0, 4], [0, 5], [0, 6], [0, 7], 'R'],
    ['K', '04', '00', -2, [0, 4], [0, 3], [0, 2], [0, 0], 'R'],
    ['k', '74', '77', 2, [7, 4], [7, 5], [7, 6], [7, 7], 'r'],
    ['k', '74', '70', -2, [7, 4], [7, 3], [7, 2], [7, 0], 'r']
]

function castling(startingPosition, endingPosition){
    let index = `${startingPosition[0]}${startingPosition[1]}`;
    let boardPiece = curBoard[startingPosition[0]][startingPosition[1]];
    let destinationIndex;
    let alreadyPiece;
    let difference;
    let cValue;
    for (x in castlingValues){
        cValue = castlingValues[x];
        if (boardPiece == cValue[0]){
            if (index == cValue[1]){
                if (boolIndexes[index]){
                    difference = endingPosition[1] - startingPosition[1];
                    if (difference == cValue[3] && boolIndexes[cValue[2]]){
                        destinationIndex = indexToIndex[index + difference.toString()];
                        if (validateMovement(cValue[7], destinationIndex)){
                            if (!isKish()){
                                curBoard[cValue[4][0]][cValue[4][1]] = '.';
                                alreadyPiece = curBoard[cValue[5][0]][cValue[5][1]];
                                curBoard[cValue[5][0]][cValue[5][1]] = cValue[0];
                                if (!isKish()){
                                    curBoard[cValue[5][0]][cValue[5][1]] = '.';
                                    alreadyPiece = curBoard[cValue[6][0]][cValue[6][1]];
                                    curBoard[cValue[6][0]][cValue[6][1]] = cValue[0];
                                    if (!isKish()){
                                        curBoard[cValue[5][0]][cValue[5][1]] = cValue[8];
                                        curBoard[cValue[7][0]][cValue[7][1]] = '.';
                                        return [cValue[7], destinationIndex, cValue[8]];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
        
}

function sortFunction(a, b) {
    if (a[2] === b[2]) {
        return 0;
    }
    else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}

function whitePlay(){
    let boardPiece;
    let tempSocre = 0;
    let maxPosition = [];
    let maxScore = 0;
    let alreadyPiece;
    for (let i=0; i<8; i++){
        for (let j=0; j<8; j++){
            boardPiece = curBoard[i][j];
            if (boardPiece != '.' && boardPiece == boardPiece.toLowerCase()){
                for (let x=0; x<8; x++){
                    for (let y=0; y<8; y++){
                        if (i != x || j != y){
                            if (validateMovement([i, j], [x, y])){
                                alreadyPiece = curBoard[x][y];
                                tempSocre = kill([x, y]);
                                curBoard[i][j] = '.';
                                curBoard[x][y] = boardPiece;
                                if (!isKish()){
                                    if (numberMovesBot > 0){
                                        tempSocre += checkThreats();
                                    }
                                    curPlayer = 'black';
                                    if (isKish()){
                                        if (isCheckMate()){
                                            tempSocre += 100000;
                                        }
                                    }
                                    curPlayer = 'white';
                                    if (tempSocre >= maxScore){
                                        maxScore = tempSocre;
                                        maxPosition = [[i, j], [x, y], maxScore];
                                    }
                                }
                                curBoard[i][j] = boardPiece;
                                curBoard[x][y] = alreadyPiece;
                            }
                        }
                    }
                }
            }
        }
    }
    return maxPosition;
}

function blackPlay(){
    let boardPiece;
    let tempSocre = 0;
    let maxPosition = [];
    let maxScore = 0;
    let alreadyPiece;
    for (let i=0; i<8; i++){
        for (let j=0; j<8; j++){
            boardPiece = curBoard[i][j];
            if (boardPiece != '.' && boardPiece == boardPiece.toUpperCase()){
                for (let x=0; x<8; x++){
                    for (let y=0; y<8; y++){
                        if (i != x || j != y){
                            if (validateMovement([i, j], [x, y])){
                                alreadyPiece = curBoard[x][y];
                                tempSocre = kill([x, y]);
                                curBoard[i][j] = '.';
                                curBoard[x][y] = boardPiece;
                                if (!isKish()){
                                    if (numberMovesBot > 0){
                                        tempSocre += checkThreats();
                                    }
                                    curPlayer = 'white';
                                    if (isKish()){
                                        if (isCheckMate()){
                                            tempSocre += 100000;
                                        }
                                    }
                                    curPlayer = 'black';
                                    if (tempSocre >= maxScore){
                                        maxScore = tempSocre;
                                        maxPosition = [[i, j], [x, y], maxScore];
                                    }
                                }
                                curBoard[i][j] = boardPiece;
                                curBoard[x][y] = alreadyPiece;
                            }
                        }
                    }
                }
            }
        }
    }
    return maxPosition;
}


function play(){
    if (numberMovesBot == 0){
        let squareElement = document.getElementById(`${2}${5}`);
        let piece = squareElement.firstChild;
        if (movePiece(piece, [1, 4], [3, 4])){
            numberMovesBot++;
            return;
        }
    }
    let boardPiece;
    let tempSocre = 0;
    let maxPositions = [];
    let alreadyPiece;
    let predictMovement1, predictMovement2, predictMovement3, predictMovement4,
    predictMovement5;
    let boardPiece2, alreadyPiece2, boardPiece3, alreadyPiece3,
    boardPiece4, alreadyPiece4, boardPiece5, alreadyPiece5;
    for (let i=0; i<8; i++){
        for (let j=0; j<8; j++){
            boardPiece = curBoard[i][j];
            if (boardPiece != '.' && boardPiece == boardPiece.toUpperCase()){
                for (let x=0; x<8; x++){
                    for (let y=0; y<8; y++){
                        if (i != x || j != y){
                            if (validateMovement([i, j], [x, y])){
                                alreadyPiece = curBoard[x][y];
                                tempSocre = kill([x, y]);
                                curBoard[i][j] = '.';
                                curBoard[x][y] = boardPiece;
                                if (!isKish()){
                                    if (numberMovesBot > 0){
                                        tempSocre += checkThreats();
                                    }
                                    curPlayer = 'white';
                                    if (isKish()){
                                        if (isCheckMate()){
                                            tempSocre += 1000000000;
                                        }
                                    }
                                    predictMovement1 = whitePlay();
                                    if (!predictMovement1.length){
                                        tempSocre += 100000000;
                                    }
                                    else {
                                        tempSocre -= predictMovement1[2];
                                        if (levelBot > 1){
                                            boardPiece2 = curBoard[predictMovement1[0][0]][predictMovement1[0][1]];
                                            alreadyPiece2 = curBoard[predictMovement1[1][0]][predictMovement1[1][1]];
                                            curBoard[predictMovement1[0][0]][predictMovement1[0][1]] = '.';
                                            curBoard[predictMovement1[1][0]][predictMovement1[1][1]] = boardPiece2;
                                            curPlayer = 'black';
                                            predictMovement2 = blackPlay();
                                            if (!predictMovement2.length){
                                                tempSocre -= 10000000;
                                            }
                                            else {
                                                tempSocre += predictMovement2[2];
                                                boardPiece3 = curBoard[predictMovement2[0][0]][predictMovement2[0][1]];
                                                alreadyPiece3 = curBoard[predictMovement2[1][0]][predictMovement2[1][1]];
                                                curBoard[predictMovement2[0][0]][predictMovement2[0][1]] = '.';
                                                curBoard[predictMovement2[1][0]][predictMovement2[1][1]] = boardPiece3;
                                                curPlayer = 'white';
                                                predictMovement3 = whitePlay();
                                                if (!predictMovement3.length){
                                                    tempSocre += 1000000;
                                                }
                                                else {
                                                    tempSocre -= predictMovement3[2];
                                                    if (levelBot > 2){
                                                        boardPiece4 = curBoard[predictMovement3[0][0]][predictMovement3[0][1]];
                                                        alreadyPiece4 = curBoard[predictMovement3[1][0]][predictMovement3[1][1]];
                                                        curBoard[predictMovement3[0][0]][predictMovement3[0][1]] = '.';
                                                        curBoard[predictMovement3[1][0]][predictMovement3[1][1]] = boardPiece4;
                                                        curPlayer = 'black';
                                                        predictMovement4 = blackPlay();
                                                        if (!predictMovement4.length){
                                                            tempSocre -= 100000;
                                                        }
                                                        else {
                                                            tempSocre += predictMovement4[2];
                                                            boardPiece5 = curBoard[predictMovement4[0][0]][predictMovement4[0][1]];
                                                            alreadyPiece5 = curBoard[predictMovement4[1][0]][predictMovement4[1][1]];
                                                            curBoard[predictMovement4[0][0]][predictMovement4[0][1]] = '.';
                                                            curBoard[predictMovement4[1][0]][predictMovement4[1][1]] = boardPiece5;
                                                            curPlayer = 'white';
                                                            predictMovement5 = whitePlay();
                                                            if (!predictMovement5.length){
                                                                tempSocre += 10000;
                                                            }
                                                            else {
                                                                tempSocre -= predictMovement5[2];
                                                            }
                                                            curBoard[predictMovement4[0][0]][predictMovement4[0][1]] = boardPiece5;
                                                            curBoard[predictMovement4[1][0]][predictMovement4[1][1]] = alreadyPiece5;
                                                        }
                                                        curBoard[predictMovement3[0][0]][predictMovement3[0][1]] = boardPiece4;
                                                        curBoard[predictMovement3[1][0]][predictMovement3[1][1]] = alreadyPiece4;
                                                    }
                                                }
                                                curBoard[predictMovement2[0][0]][predictMovement2[0][1]] = boardPiece3;
                                                curBoard[predictMovement2[1][0]][predictMovement2[1][1]] = alreadyPiece3;
                                            }
                                            curBoard[predictMovement1[0][0]][predictMovement1[0][1]] = boardPiece2;
                                            curBoard[predictMovement1[1][0]][predictMovement1[1][1]] = alreadyPiece2;
                                        }
                                    }
                                    maxPositions.push([[i, j], [x, y], tempSocre]);
                                }
                                curPlayer = 'black';
                                curBoard[i][j] = boardPiece;
                                curBoard[x][y] = alreadyPiece;
                            }
                        }
                    }
                }
            }
        }
    }
    maxPositions.sort(sortFunction);
    let length = maxPositions.length;
    let canMove = false;
    let maxPosition;
    let starterPosition;
    let endingPosition;
    let squareElement;
    let piece;
    do {
        try {
            maxPosition = maxPositions[length-1]
            starterPosition = [maxPosition[0][0], maxPosition[0][1]];
            endingPosition = [maxPosition[1][0], maxPosition[1][1]];
            squareElement = document.getElementById(`${starterPosition[0]+1}${starterPosition[1]+1}`);
            piece = squareElement.firstChild;
            if (movePiece(piece, starterPosition, endingPosition)){
                console.log(maxPosition[2]);
                canMove = true;
                numberMovesBot++;
                break;
            }
            else {
                maxPositions.pop();
                length--;
            }
        }
        catch {
            alert("White Won!");
            canMove = true;
            return;
        }
    } while (!canMove);
}


function main() {
    let likeBot = prompt("do you want to play with bot ? \nyes\nno", "yes");
    if (likeBot == 'yes'){
        playWithBot = true;
        levelBot = prompt("which level? \n1\n2\n3", 1);
    }
}

main();
disablePageRefreshFacility();
startGame();
setPieceHoldEvents();