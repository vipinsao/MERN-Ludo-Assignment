const { sendToPlayersRolledNumber, sendWinner, sendScoreUpdate } = require('../socket/emits');

const rollDice = () => {
    const rolledNumber = Math.ceil(Math.random() * 6);
    return rolledNumber;
};

const makeRandomMove = async roomId => {
    const { updateRoom, getRoom } = require('../services/roomService');
    const room = await getRoom(roomId);
    if (room.winner) return;
    if (room.rolledNumber === null) {
        room.rolledNumber = rollDice();
        sendToPlayersRolledNumber(room._id.toString(), room.rolledNumber);
    }

    const pawnsThatCanMove = room.getPawnsThatCanMove();
    if (pawnsThatCanMove.length > 0) {
        const randomPawn = pawnsThatCanMove[Math.floor(Math.random() * pawnsThatCanMove.length)];
        // room.movePawn(randomPawn);

        //Scoring logic with movement
        const updatedScores = room.movePawnWithScoring(randomPawn, room.rolledNumber);

        //Emit scores update after move
        sendScoreUpdate(room._id.toString(), updatedScores);
    }
    room.changeMovingPlayer();
    const winner = room.getWinner();
    if (winner) {
        room.endGame(winner);
        sendWinner(room._id.toString(), winner);
    }
    await updateRoom(room);
};

const isMoveValid = (session, pawn, room) => {
    if (session.color !== pawn.color) {
        return false;
    }
    if (session.playerId !== room.getCurrentlyMovingPlayer()._id.toString()) {
        return false;
    }
    return true;
};

module.exports = { rollDice, makeRandomMove, isMoveValid };
