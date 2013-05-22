$(document).bind('gameStarted', function () {
    //Put here some code.
    console.log("game started");
});

$(document).bind('gameFinished', function (e,statistic) {
    //Put here some code.
    console.log("game Finished. Statistic- ", statistic);
});

