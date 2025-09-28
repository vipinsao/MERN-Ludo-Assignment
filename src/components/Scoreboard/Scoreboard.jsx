import React from 'react';
import styles from './Scoreboard.module.css';

function Scoreboard({ scores, captures, players, currentTurnPlayer }) {
    if (!scores) return null;
    const entries = Object.entries(scores);
    return (
        <div className={styles.board}>
            <h4>Scoreboard</h4>
            {entries.map(([color, score]) => (
                <div key={color} className={styles.item}>
                    <span className={styles.colorBox} style={{ background: color }} />
                    <span>{players.find(p => p.color === color)?.name || color}</span>
                    <span>
                        - {score} pts {captures[color] ? `• ${captures[color]} cap` : ''}
                    </span>
                    {currentTurnPlayer === color && <strong> ← Your Turn</strong>}
                </div>
            ))}
        </div>
    );
}

export default Scoreboard;
