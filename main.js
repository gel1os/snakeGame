var settings = {
        'gridSize': 20,
        'startDirection': 'right',
        'speedOfMovement': 200,
        'minimalSpeed': 100,
        'increaseAfter': 50,
        'reduceBy': 20
    },
    currentSnakesState = [],
    gameOver = false,
    paused = false,
    resumingGame = false;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateGrid(gridSize) {
    var arr = Array.apply(null, {
            length: gridSize
        }).map(Number.call, Number),
        firstPoint,
        snakesHead,
        snakesTail;
    $('.wrapper').append($('<div class="grid-container"></div>'));
    arr.forEach(function(n, i) {
        $('.grid-container').append($('<div class="row r' + n + '"></div>'));
        arr.forEach(function(_n) {
            $('.row.r' + n).append($('<div class="cell c' + _n + ' r' + n + '" data-row="' + n + '" data-cell="' + _n + '"></div>'));
        });
    });

    firstPoint = '.grid-container .r' + getRandomInt(0, gridSize - 1) + '.c' + getRandomInt(0, gridSize - 1);
    snakesHead = '.grid-container .r10 .c10';
    snakesTail = '.grid-container .r10 .c9, .grid-container .r10 .c8';

    // @ currentSnakesState[row, cell]
    currentSnakesState = [
        [10, 8],
        [10, 9],
        [10, 10]
    ];

    $(firstPoint).addClass('black');
    $(snakesHead).addClass('snake snakesHead');
    $(snakesTail).addClass('snake');
    return gridSize;
}

function addBlackCell() {
    var emptyCells = '.cell:not(.snake):not(.black)';
    $($(emptyCells)[Math.floor(Math.random() * $(emptyCells).length)]).addClass('black');
}

function finishGame(interval) {
    clearInterval(interval);
    $('.gameOver .scoreMes').text('Your score is: ' + jQuery('.totalScore').text());
    $('.gameOver').removeClass('hidden');
    gameOver = true;
}

function tryAgain() {
    location.reload();
}

function countScore() {
    var $totalScore = $('.totalScore');
    $totalScore.text(+$totalScore.text() + 10);

    if (+$totalScore.text() % settings['increaseAfter'] === 0 && settings['speedOfMovement'] !== settings['minimalSpeed']) {
        $(document).trigger('increaseSpeed')
    }
}

function moveSnake(direction, size, interval) {
    var directions = {
            //description:
            //direction[0] === cells,
            //direction[1] === rows,
            //direction[2] === limited by,
            //directions[3] === limit value
            top: [0, -1, 'data-row', 0],
            right: [1, 0, 'data-cell', size - 1],
            bottom: [0, 1, 'data-row', size - 1],
            left: [-1, 0, 'data-cell', 0]
        },

        $snakesHead = $('.snakesHead'),
        currentRow = $snakesHead.attr('data-row'),
        currentCell = $snakesHead.attr('data-cell'),
        nextCell,
        nextRow,
        nextElem;

    // @ currentSnakesState[row, cell]
    nextCell = +currentCell + directions[direction][0];
    nextRow = +currentRow + directions[direction][1];
    nextElem = $('.grid-container .r' + nextRow + '.c' + nextCell);

    currentSnakesState.push([nextRow, nextCell]);

    if (nextElem.hasClass('snake')) {
        finishGame(interval, 'You lose, sucker!!');
        return;
    }

    if (nextElem.hasClass('black')) {
        $snakesHead.removeClass('snakesHead');
        nextElem.removeClass('black').addClass('snake snakesHead');
        //moveHead(direction, size, interval);
        countScore();
        addBlackCell();
    } else {
        nextElem.addClass('snake snakesHead');
        if (+$snakesHead.attr(directions[direction][2]) === directions[direction][3]) {
            finishGame(interval, 'You lose, sucker!!');
            return;
        }

        for (var i = currentSnakesState.length - 1; i > 0; i--) {
            $('.grid-container .r' + currentSnakesState[i - 1][0] + '.c' + currentSnakesState[i - 1][1]).removeClass('snake snakesHead');
            $('.grid-container .r' + currentSnakesState[i][0] + '.c' + currentSnakesState[i][1]).addClass('snake');
        }
        currentSnakesState.splice(0, 1);
    }
}

$(document).ready(function() {
    var gridSize = generateGrid(settings['gridSize']),
        movement,
        direction = settings['startDirection'],
        keyPressed = false;

    movement = setInterval(function() {
        moveSnake(direction, gridSize, movement);
    }, settings['speedOfMovement']);

    $(document).on('increaseSpeed', function() {
        settings['speedOfMovement'] -= settings['reduceBy'];
        clearInterval(movement);
        movement = setInterval(function() {
            moveSnake(direction, gridSize, movement);
        }, settings['speedOfMovement']);
    });

    $(document).keyup(function(event) {

        var keyCodes = {
            // сode : [moveTo, opposite]
            '37': ['left', 'right'],
            '65': ['left', 'right'],
            '87': ['top', 'bottom'],
            '38': ['top', 'bottom'],
            '39': ['right', 'left'],
            '68': ['right', 'left'],
            '40': ['bottom', 'top'],
            '83': ['bottom', 'top']
        };

        if (keyPressed) {
            return
        }

        if (keyCodes[event.keyCode] && direction !== keyCodes[event.keyCode][1]) {
            keyPressed = true;
            direction = keyCodes[event.keyCode][0];
            setTimeout(function() {
                keyPressed = false;
            }, settings['speedOfMovement']);
        } else if (event.keyCode === 13) {
            tryAgain();
        } else if (event.keyCode === 32 && !gameOver && !resumingGame) {
            var $pausedPopUp = $('.paused'),
                $pausedMsg = $('.pauseMsg');

            if (paused) {
                resumingGame = true;

                $pausedMsg.text('|||');
                $pausedMsg.addClass('countdown');

                var showCountdown = setInterval(function() {
                    $pausedMsg.text($pausedMsg.text().replace('|', ''))
                }, 500);

                // start countdown for resuming game
                setTimeout(function() {
                    clearInterval(showCountdown);
                    $pausedPopUp.addClass('hidden');
                    $pausedMsg.removeClass('countdown');
                    $pausedMsg.html('<span>Game paused.</span><br><span>Hit space to continue...</span>');
                    paused = false;
                    movement = setInterval(function() {
                        moveSnake(direction, gridSize, movement);
                    }, settings['speedOfMovement']);
                    resumingGame = false;
                }, 1500);

            } else {
                // pause game
                clearInterval(movement);
                paused = true;
                $pausedPopUp.removeClass('hidden');
            }
        }
    });
    $('.tryAgain').click(function() {
        tryAgain();
    })
});
