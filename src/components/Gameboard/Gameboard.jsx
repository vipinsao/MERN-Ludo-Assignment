import React, { useState, useEffect, useContext } from 'react';
import ReactLoading from 'react-loading';
import { PlayerDataContext, SocketContext } from '../../App';
import useSocketData from '../../hooks/useSocketData';
import Map from './Map/Map';
import Navbar from '../Navbar/Navbar';
import Overlay from '../Overlay/Overlay';
import styles from './Gameboard.module.css';
import trophyImage from '../../images/trophy.webp';

import Timer from '../Timer/Timer';
import Scoreboard from '../Scoreboard/Scoreboard';

const Gameboard = () => {
    const socket = useContext(SocketContext);
    const context = useContext(PlayerDataContext);
    const [pawns, setPawns] = useState([]);
    const [players, setPlayers] = useState([]);

    const [rolledNumber, setRolledNumber] = useSocketData('game:roll');
    const [time, setTime] = useState();
    const [isReady, setIsReady] = useState();
    const [nowMoving, setNowMoving] = useState(false);
    const [started, setStarted] = useState(false);

    const [movingPlayer, setMovingPlayer] = useState('red');

    const [winner, setWinner] = useState(null);

    //States for scores and capture stats
    const [scores, setScores] = useState({});
    const [captureStats, setCaptureStats] = useState({});
    useEffect(() => {
        socket.emit('room:data', context.roomId);
        socket.on('room:data', data => {
            data = JSON.parse(data);
            if (data.players == null) return;
            // Filling navbar with empty player nick container
            while (data.players.length !== 4) {
                data.players.push({ name: '...' });
            }

            //Update pawn and Player state
            setPlayers(data.players);
            setPawns(data.pawns);
            setRolledNumber(data.rolledNumber);
            setTime(data.nextMoveTime);
            setStarted(data.started);

            //track whoes turn it is
            const currPlayer = data.players.find(player => player.nowMoving);
            if (currPlayer) {
                setNowMoving(currPlayer._id === context.playerId);
                setMovingPlayer(currPlayer.color);
            }

            // ready state for current user
            const me = data.players.find(p => p._id === context.playerId);
            setIsReady(me?.ready);

            // optionally initialize captureStats
            if (data.captureStats) {
                setCaptureStats(data.captureStats);
            }

            // Checks if client is currently moving player by session ID
            // const nowMovingPlayer = data.players.find(player => player.nowMoving === true);
            // if (nowMovingPlayer) {
            //     if (nowMovingPlayer._id === context.playerId) {
            //         setNowMoving(true);
            //     } else {
            //         setNowMoving(false);
            //     }
            //     setMovingPlayer(nowMovingPlayer.color);
            // }
            // const currentPlayer = data.players.find(player => player._id === context.playerId);
            // setIsReady(currentPlayer.ready);
            // setRolledNumber(data.rolledNumber);
            // setPlayers(data.players);
            // setPawns(data.pawns);
            // setTime(data.nextMoveTime);
            // setStarted(data.started);
        });

        //listening for real-time score updates
        socket.on('game:scores', updatedScores => {
            setScores(updatedScores);
        });

        // OPTIONAL: listen for individual capture events
        socket.on('capture:happened', info => {
            setCaptureStats(prev => ({
                ...prev,
                [info.color]: info.count,
            }));
        });

        socket.on('game:winner', winner => {
            setWinner(winner);
        });
        socket.on('redirect', () => {
            window.location.reload();
        });
        return () => {
            socket.off('room:data');
            socket.off('game:scores');
            socket.off('capture:happened');
            socket.off('game:winner');
            socket.off('redirect');
        };
    }, [socket, context.playerId, context.roomId, setRolledNumber]);

    return (
        <>
            {pawns.length === 16 ? (
                <div className='container'>
                    <div className={styles.sidebar}>
                        {/* Added Sidebar for timer and scoreboard  */}
                        <Timer nextMoveTime={time} gameStarted={started} gameEnded={winner != null} />
                        <Scoreboard
                            scores={scores}
                            captures={captureStats}
                            players={players}
                            currentTurnPlayer={movingPlayer}
                        />
                    </div>
                    <Navbar
                        players={players}
                        started={started}
                        time={time}
                        isReady={isReady}
                        movingPlayer={movingPlayer}
                        rolledNumber={rolledNumber}
                        nowMoving={nowMoving}
                        ended={winner !== null}
                    />
                    <Map pawns={pawns} nowMoving={nowMoving} rolledNumber={rolledNumber} />
                </div>
            ) : (
                <ReactLoading type='spinningBubbles' color='white' height={667} width={375} />
            )}
            {winner ? (
                <Overlay>
                    <div className={styles.winnerContainer}>
                        <img src={trophyImage} alt='winner' />
                        <h1>
                            1st: <span style={{ color: winner }}>{winner}</span>
                            <br />
                            <span>{scores[winner] || 0} pts</span>
                        </h1>
                        <button onClick={() => socket.emit('player:exit')}>Play again</button>
                    </div>
                </Overlay>
            ) : null}
        </>
    );
};

export default Gameboard;
