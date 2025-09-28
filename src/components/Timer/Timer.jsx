import React, { useState, useEffect } from 'react';
import styles from './Timer.module.css';

function Timer({ nextMoveTime, gameStarted, gameEnded }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!gameStarted || gameEnded) return;
        const tick = () => {
            const diff = Math.max(0, nextMoveTime - Date.now());
            setTimeLeft(Math.ceil(diff / 1000));
        };
        tick();
        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [nextMoveTime, gameStarted, gameEnded]);

    if (!gameStarted || gameEnded || timeLeft <= 0) return null;

    const mins = Math.floor(timeLeft / 60);
    const secs = String(timeLeft % 60).padStart(2, '0');
    return (
        <div className={styles.timer}>
            <span>
                ⏰ {mins}:{secs}
            </span>
            <div className={styles.bar}>
                <div className={styles.progress} style={{ width: `${(timeLeft / 30) * 100}%` }} />
            </div>
        </div>
    );
}

export default Timer;
