import React from 'react';
import lotto from '../assets/lotto.png'
import GameStatusBadge from "./GameStatusBadge";
import AnimatedNumber from 'react-animated-number';

const styles = {
    Panel: {
        marginTop: "5px",
        background: 'linear-gradient(0deg, #11cdef 0,#1171ef 100%)',
        color: "white",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,.5)",
        width: 450,
        padding: "8px",
        borderRadius: "6px",
    },
    PanelHeader: {
        color: "white"
    },
    LotteryLogo: {
      width: '55px',
    },
    Info: {
        fontWeight: "bold"
    },
    TimeLeft: {
        fontWeight: "bold",
        float: "right"
    },
    Jackpot: {
        fontWeight: "bold",
        fontSize: 17,
        margin: "5px"
    }
};

const CurrentGame = ({currentFee, nrOfPlayers, gameStatus, timeLeft, jackpot}) =>{
    return(
        <div style={styles.Panel}>
            { gameStatus !== 'OPEN' ? (
                <h5 style={styles.TimeLeft}>Time left: {getTimeString(timeLeft)}</h5>
            ): null}
            <br/>
            <br/>
            <img style={styles.LotteryLogo} src={lotto} alt="Logo" />
            <br/>
            <div>
                <h5 style={styles.Jackpot}>Jackpot</h5>
                <AnimatedNumber value={Number(jackpot)}
                                stepPrecision={4}
                                style={{
                                    transition: '0.8s ease-out',
                                    fontSize: 18,
                                    transitionProperty:
                                        'background-color, color, opacity'
                                }}
                                duration={600}
                                formatValue={n=>{
                                    if(n%1!==0){
                                        return `${n.toFixed(4)} ETH`
                                    }
                                    return `${n} ETH`
                                }}/>
            </div>
            <h5 style={styles.Info}>Current Number Of Players: {nrOfPlayers}</h5>
            <h5 style={styles.Info}>Lottery Status: <GameStatusBadge status={gameStatus}/></h5>
        </div>
    );
};

function getTimeString(t){
    return `${Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}:${Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))}:${Math.floor((t % (1000 * 60)) / 1000)}`
}

export default CurrentGame;
