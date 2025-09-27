//Score calculation logic

function updatePawnScore(pawn, diceValue) {
    //Add dice roll value to pawn score
    pawn.score += diceValue;
    return pawn.score;
}

function handleCapture(attackerPawn, victimPawn) {
    //Attacker pawn gets victim pawn's score and victim score resets to 0
    let pointsTransferred = victimPawn.score;
    attackerPawn.score += pointsTransferred;
    victimPawn.score = 0;
    return {
        pointsGained: pointsTransferred,
        newAttackerScore: attackerPawn.score,
    };
}

function calculatePlayerTotalScore(pawns, playerColor) {
    //Total score for a player is the sum of scores of all their pawns
    let total = 0;
    for (let i = 0; i < pawns.length; i++) {
        if (pawns[i].color === playerColor) {
            total += pawns[i].score;
        }
    }
    return total;
}

function getScoresForAllPlayers(room) {
    //Calculates and returns scores for all players in the room
    const scores = {};
    room.players.forEach(player => {
        if (player.color) {
            scores[player.color] = calculatePlayerTotalScore(room.pawns, player.color);
        }
    });
    return scores;
}

function updateCaptureCount(room, playerColor) {
    //Increment capture count for the player who made the capture
    if (!room.captureStats) {
        room.captureStats = {};
    }
    if (!room.captureStats[playerColor]) {
        room.captureStats[playerColor] = 0;
    }
    room.captureStats[playerColor]++;
    return room.captureStats[playerColor];
}

module.exports = {
    updatePawnScore,
    handleCapture,
    calculatePlayerTotalScore,
    getScoresForAllPlayers,
    updateCaptureCount,
};
