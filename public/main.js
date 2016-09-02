;
(function () {
    var settings = {
        'gridSize': 20,
        'startDirection': 'right',
        'speedOfMovement': 200,
        'minimalSpeed': 100,
        'increaseSpeedEvery': 50,
        'increaseSpeedBy': 20
    };
    var directions = {
        top: {
            'nextCell': 0,
            'nextRow': -1,
            'limitation': 'data-row',
            'limitationValue': 0
        },
        bottom: {
            'nextCell': 0,
            'nextRow': 1,
            'limitation': 'data-row',
            'limitationValue': settings.gridSize - 1
        },
        right: {
            'nextCell': 1,
            'nextRow': 0,
            'limitation': 'data-cell',
            'limitationValue': settings.gridSize - 1
        },
        left: {
            'nextCell': -1,
            'nextRow': 0,
            'limitation': 'data-cell',
            'limitationValue': 0
        }
    };
    var directionKeyCodes = {
        '37': {
            'direction': 'left',
            'opposite': 'right'
        },
        '65': {
            'direction': 'left',
            'opposite': 'right'
        },
        '87': {
            'direction': 'top',
            'opposite': 'bottom'
        },
        '38': {
            'direction': 'top',
            'opposite': 'bottom'
        },
        '39': {
            'direction': 'right',
            'opposite': 'left'
        },
        '68': {
            'direction': 'right',
            'opposite': 'left'
        },
        '40': {
            'direction': 'bottom',
            'opposite': 'top'
        },
        '83': {
            'direction': 'bottom',
            'opposite': 'top'
        }
    };
    var currentSnakesState = [];
    var gameOver = false;
    var paused = false;
    var resumingGame = false;
    var $doc = $(document);
    var direction = settings.startDirection;
    var nextDirection = null;
    var movement;
    var gridSize;

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * create array of elements from 0 to elemNumber
     * @param elemNumber
     * @returns {Array|*}
     */
    function createArray(elemNumber) {
        return Array.apply(null, { length: elemNumber }).map(Number.call, Number);
    }

    function createRow(rowNumber) {
        return $('<div/>', {
            'class': 'row  r' + rowNumber
        });
    }

    function createCell(rowNumber, cellNumber) {
        return $('<div/>', {
            'class': 'cell r' + rowNumber + ' c' + cellNumber,
            'data-row': rowNumber,
            'data-cell': cellNumber
        });
    }

    function generateGrid(gridSize) {
        var arr = createArray(gridSize);
        var $gridContainer = $('.grid-container');
        var $row;
        var $cell;

        arr.forEach(function (rowNumber) {
            $row = createRow(rowNumber);

            arr.forEach(function (cellNumber) {
                $cell = createCell(rowNumber, cellNumber);
                $row.append($cell);
            });

            $gridContainer.append($row);
        });

        return gridSize;
    }

    /**
     * set initial snake's position
     */
    function placeSnake() {
        var $snakesHead = $('.r10 .c10');
        var $snakesTail = $('.r10 .c9, .r10 .c8');

        currentSnakesState = [[10, 8], [10, 9], [10, 10]];

        $snakesHead.addClass('snake snake-head');
        $snakesTail.addClass('snake');
    }

    /**
     * set initial position of point
     * @param gridSize - number
     */
    function placeFirstBlackCell() {
        var randomRow = getRandomInt(0, gridSize - 1);
        var randomCell = getRandomInt(0, gridSize - 1);
        var $firstPoint = $('.r' + randomRow + '.c' + randomCell);
        $firstPoint.addClass('black');
    }

    function addBlackCell() {
        var $emptyCells = $('.cell:not(.snake):not(.black)');
        var emptyCellsAmount = $emptyCells.length;
        var randomCellIndex = Math.floor(Math.random() * emptyCellsAmount);
        var $randomCell = $($emptyCells[randomCellIndex]);

        $randomCell.addClass('black')
    }

    function increaseSnake(head, blackCell) {
        head.removeClass('snake-head');
        blackCell.removeClass('black').addClass('snake snake-head');
    }

    function finishGame() {
        var $gameOverDiv = $('.gameOver');
        var $scoreMessage = $gameOverDiv.find('.score-message');
        var totalScore = $('.total-score').text();

        $scoreMessage.text('Your score is: ' + totalScore);
        $gameOverDiv.removeClass('hidden');
        gameOver = true;
    }

    function tryAgain() {
        location.reload();
    }

    function countScore() {
        var $totalScore = $('.total-score');
        var score = parseInt($totalScore.text(), 10);

        $totalScore.text(score + 10);

        if (score % settings.increaseSpeedEvery === 0) {
            $doc.trigger('increaseSpeed');
        }
    }

    /**
     * check if snake's head reached border of grid
     * @param head - DOM element
     * @param direction - object
     */
    function isReachedBorder(head, direction) {
        var limitationAxis = direction.limitation;
        var currentLimitationValue = parseInt(head.attr(limitationAxis), 10);
        return currentLimitationValue === direction.limitationValue;
    }

    /**
     * set nextCell as a head of snake,
     * shift snake according to current snake's state
     */
    function shiftSnake(nextCell) {

        var lastTailElementCoordinates = currentSnakesState[0];
        var lastRow = lastTailElementCoordinates[0];
        var lastCell = lastTailElementCoordinates[1];

        var $lastTailElement = $('.r' + lastRow + '.c' + lastCell);
        var $snakeHead = $('.snake-head');

        $snakeHead.removeClass('snake-head');
        nextCell.addClass('snake snake-head');

        $lastTailElement.removeClass('snake');

        currentSnakesState.splice(0, 1);
    }

    /**
     * get next cell according to movement direction
     * @param head - DOM element
     * @param direction - object
     * @returns {*|jQuery|HTMLElement} - DOM element of next cell
     */
    function countNextCell(head, direction) {

        var row = parseInt(head.attr('data-row'), 10);
        var cell = parseInt(head.attr('data-cell'), 10);
        var nextCell;
        var nextRow;

        nextCell = cell + direction.nextCell;
        nextRow = row + direction.nextRow;

        currentSnakesState.push([nextRow, nextCell]);

        return $('.r' + nextRow + '.c' + nextCell);
    }

    function moveSnake(head, nextCell, direction) {
        var isBorder = isReachedBorder(head, direction);

        if (isBorder) {
            finishGame();
        } else {
            shiftSnake(nextCell);
        }
    }

    function initSnakeMovement() {
        direction = nextDirection || direction;
        directionData = directions[direction];
        nextDirection = null;

        var $snakesHead = $('.snake-head');
        var $nextCell = countNextCell($snakesHead, directionData);

        if ($nextCell.hasClass('snake')) {
            finishGame();
        } else if ($nextCell.hasClass('black')) {
            increaseSnake($snakesHead, $nextCell);
            countScore();
            addBlackCell();
        } else {
            moveSnake($snakesHead, $nextCell, directionData);
        }
    }

    function queueMoveIntent(chosenDirection) {
        var isOppositeDirection = direction === chosenDirection.opposite;
        
        if (!isOppositeDirection) {
            nextDirection = chosenDirection.direction;
        }
    }

    function pauseGame(popup) {
        clearInterval(movement);
        paused = true;
        popup.removeClass('hidden');
    }

    function restoreInitialResumeMessage(message) {
        var initialHtml = '<span>Game paused.</span>' +
            '<br>' +
            '<span>Hit space to continue...</span>';
        message
            .removeClass('countdown')
            .html(initialHtml);
    }

    function resumeGame($popup, $message) {
        resumingGame = true;

        $message.text('|||');
        $message.addClass('countdown');

        var showCountdown = setInterval(function () {
            $message.text($message.text().replace('|', ''))
        }, 500);

        setTimeout(function () {
            clearInterval(showCountdown);
            $popup.addClass('hidden');
            restoreInitialResumeMessage($message);
            paused = false;
            initMovementInsideInterval();
            resumingGame = false;
        }, 1500);
    }

    function togglePausing() {
        var $pausedPopUp = $('.paused');
        var $pausedMsg = $('.pause-message');

        if (paused) {
            resumeGame($pausedPopUp, $pausedMsg);
        } else {
            pauseGame($pausedPopUp);
        }
    }

    /**
     * executed after "keyup" event is fired
     *
     */
    function keyUpHandler(event) {

        var pressedCode = event.keyCode;
        var ENTER_CODE = 13;
        var SPACE_CODE = 32;
        var chosenDirection = directionKeyCodes[pressedCode];
        var isOppositeDirection;

        if (chosenDirection) {
            queueMoveIntent(chosenDirection);
        } else if (event.keyCode === ENTER_CODE) {
            tryAgain();
        } else if (event.keyCode === SPACE_CODE && !gameOver && !resumingGame) {
            togglePausing();
        }
    }

    function initMovementInsideInterval() {
        movement = setInterval(function () {
            initSnakeMovement();
            if (gameOver) {
                clearInterval(movement);
            }
        }, settings.speedOfMovement);
    }

    function increaseSpeed() {
        settings.speedOfMovement -= settings.increaseSpeedBy;

        if (settings.speedOfMovement >= 0) {
            clearInterval(movement);
            initMovementInsideInterval()
        }
    }

    function init() {
        gridSize = generateGrid(settings['gridSize']);
        placeSnake();
        placeFirstBlackCell();
        initMovementInsideInterval();

        $doc.on('increaseSpeed', increaseSpeed);
        $doc.on('keyup', keyUpHandler);
        $('.try-again').click(tryAgain);
    }

    $(init);
} ());