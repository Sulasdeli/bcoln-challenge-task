import React, {Component} from 'react';
import {BrowserRouter,withRouter} from 'react-router-dom'
import Web3 from "web3";
import Footer from "./views/Footer";
import Header from "./views/Header";
import RingLoader from 'react-spinners/RingLoader';
import styled from "styled-components";
import './App.css';
import {uiStartLoading, uiStopLoading} from "./store/actions/uiActionCreators";
import connect from "react-redux/es/connect/connect";
import {withCookies} from "react-cookie"
import DLottery from "../build/contracts/DLottery"
import Routes from './routes/index'

let web3 = window.web3;

const Loader = styled.div`
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-color: red;
`;

class App extends Component {

    constructor() {
        super();
        let CONTRACT_ADDRESS;
        let web3Instance = null;

        if (typeof  web3 !== 'undefined') {
            web3Instance = new Web3(web3.currentProvider);
            if(web3Instance.givenProvider.networkVersion)
                CONTRACT_ADDRESS = DLottery.networks[web3Instance.givenProvider.networkVersion].address;
            else
            // NetworkVersion = 3 (Ropsten) / 5777 (Ganache)
                CONTRACT_ADDRESS = DLottery.networks["3"].address
        } else {
            alert('Please install a Web3 Provider (Metamask)')
        }

        const dLotteryContract = new web3Instance.eth.Contract(
            DLottery.abi,
            CONTRACT_ADDRESS
        );

        this.state = {
            isLoading: true,
            web3: web3Instance,
            contract: dLotteryContract,
            user: '',
            timestamps: {},
            committed: 0,
            currentPhase: '',
            fee: 0,
            timers:{},
            timeLeft:-1,
        }
    }

    async componentDidMount() {
        //TODO: get the other variables required
        await this.loadDataFromSC();
        this.getRemainingTime();
        this.props.stopLoading();
        //this.setState({isLoading: false})
        const commitEvent = this.state.contract.events.NewCommit();
        commitEvent.on('data', async () => {
            console.log("new event");
            //TODO: load only the new committed players?
            await this.loadDataFromSC();
        });
        this.timer = setInterval(() => {
            this.getRemainingTime()
        }, 1000);
    }

    componentWillUnmount(){
        clearTimeout(this.timer)
    }

    getRemainingTime(){
        let startPhase = new Date(this.state.timestamps[this.getPhaseForTimestamp(this.state.currentPhase)]);
        let endPhase = startPhase.setSeconds(startPhase.getSeconds() + this.getTimerForPhase(this.state.currentPhase));
        let remainingTime = endPhase - Date.now();
        if(remainingTime<=0){
            remainingTime = 0;
        }
        this.setState({
            timeLeft: remainingTime
        });
    }

    getUser() {
        return this.state.web3.eth
            .getAccounts()
            .then(addresses => {
                console.log(addresses)
                return addresses[0];
            })
            .catch(err => {
                console.log('error getting address ' + err);
            });
    }

    async getCurrentTimestamp() {
        return await this.state.contract.methods
            .current_timestamps()
            .call({from: this.state.user})
            .then(res => {
                return (({commit, commit_and_ready_for_reveal, payout, reveal}) => {
                    commit = new Date(this.hexToNumber(commit._hex)*1000);
                    commit_and_ready_for_reveal = new Date(this.hexToNumber(commit_and_ready_for_reveal._hex)*1000);
                    payout = new Date(this.hexToNumber(payout._hex)*1000);
                    reveal = new Date(this.hexToNumber(reveal._hex)*1000);
                    return {commit, commit_and_ready_for_reveal, payout, reveal}
                })(res);
            })
    }

    async getTimers(){
        return await this.state.contract.methods
            .getTimers()
            .call({from: this.state.user})
            .then(res => {
                return (({LEFT_COMMIT_AND_REVEAL, TO_ABORT, WAIT_TO_GO_TO_REVEAL_PHASE, TO_REVEAL}) => {
                    LEFT_COMMIT_AND_REVEAL = this.hexToNumber(LEFT_COMMIT_AND_REVEAL._hex);
                    TO_ABORT = this.hexToNumber(TO_ABORT._hex)*1000;
                    WAIT_TO_GO_TO_REVEAL_PHASE = this.hexToNumber(WAIT_TO_GO_TO_REVEAL_PHASE._hex);
                    TO_REVEAL = this.hexToNumber(TO_REVEAL._hex);
                    return {LEFT_COMMIT_AND_REVEAL, TO_ABORT, WAIT_TO_GO_TO_REVEAL_PHASE, TO_REVEAL}
                })(res);
            })
    }

    hexToNumber(n) {
        return this.state.web3.utils.hexToNumber(n);
    }

    hexToNumberString(n) {
        return this.state.web3.utils.hexToNumberString(n);
    }

    async getFee() {
        return await this.state.contract.methods
            .getFee()
            .call({from: this.state.user})
            .then(res => {
                return this.hexToNumberString(res._hex)
            })
    }

    async loadDataFromSC() {
        this.setState({
            user: await this.getUser(),
        });
        this.setState({
            timestamps: await this.getCurrentTimestamp(),
            currentPhase: await this.getCurrentPhase(),
            committed: await this.getCommitted(),
            fee: await this.getFee(),
            timers: await this.getTimers(),
        });
        //await  this.getNumberOfPlayers();
        //Load jackpot
        //load time
        //load numberofPlayers
        //load entryFee
    }

    getCurrentPhase() {
        return this.state.contract.methods
            .current_phase()
            .call({from: this.state.user})
            .then(res => {
                console.log("CURRENT PHASE", res)
                return res
            })
    }

    getCommitted() {
        return this.state.contract.methods
            .getCommitted()
            .call({from: this.state.user})
            .then(res => {
                return res.length
            })
    }

    getTimerForPhase(phase){
        switch(phase){
            case 0:
                return this.state.timers['LEFT_COMMIT_AND_REVEAL'];
            case 1:
                return this.state.timers['WAIT_TO_GO_TO_REVEAL_PHASE'];
            case 2:
                return this.state.timers['TO_REVEAL'];
            case 3:
                return 'payout';
        }
    }

    getPhaseForTimestamp(status){
        switch(status){
            case 0:
                return 'commit';
            case 1:
                return 'commit_and_ready_for_reveal';
            case 2:
                return 'reveal';
            case 3:
                return 'payout';
        }
    }

    render() {
        return (
            <div className="App">
                {this.props.isLoading ?
                    (<Loader>
                        <RingLoader
                            sizeUnit={"px"}
                            size={150}
                            color={'orange'}
                            loading={this.props.isLoading}/>
                    </Loader>) : (
                        <div style={{minHeight: '100%'}}>
                            <BrowserRouter>
                                    <Header/>
                                    <Routes state={this.state} cookies={this.props.cookies}/>
                                    <Footer/>
                            </BrowserRouter>
                        </div>
                    )}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    return {
        isLoading: state.ui.isLoading,
    };
};

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: () => dispatch(uiStartLoading()),
        stopLoading: () => dispatch(uiStopLoading()),
    }
};

export default withCookies(withRouter(connect(mapStateToProps, mapActionsToProps)(App)));