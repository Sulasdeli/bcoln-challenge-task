import React, {Component} from 'react';
import {connect} from 'react-redux'
import {Button} from 'rsuite';
import 'rsuite/dist/styles/rsuite.min.css'; // or 'rsuite/dist/styles/rsuite.min.css'
import styled from 'styled-components';
import { css } from '@emotion/core';
import {Input, InputGroup, Icon} from 'rsuite';
import CurrentGame from './CurrentGame'
import GAME_STATUS from '../const/GameStatus';
import {uiStartLoading, uiStopLoading} from '../store/actions/uiActionCreators';
import RingLoader from 'react-spinners/RingLoader';
import { withRouter, Redirect } from 'react-router-dom'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
`;

const HomeStyle = styled.div`
    height: 65vh
`;

const Loader = styled.div`
    height: 70vh
        display: flex;
      flex-direction: column;
  justify-content: center;
  align-items: center;
    border-color: red;
`;


const styles = {
    width: 450,
    marginBottom: 10,
};

const loginButtonStyle = {
    width: 250,
    height: 50,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 800
}
const stylesCurrentGame = {
    width: 500,
    marginTop: 20,
    marginBottom: 100,
    borderRadius: 7,
    fontSize: 30
};

class Home extends Component {
    async componentDidMount() {

    }

    constructor() {
       super();
        this.state = {
            redirectToLottery: false,
        }
    }

    joinLottery(){
        // let toHash = n1+this.props.user+n2;
        // let hash = this.props.web3.utils.sha3(toHash);
        // this.props.contract.methods
        //     .commit(hash)
        //     .send({from: this.props.user}, (res)=>{
        //         if(!res.message.includes('error'))
        //         this.setState({redirectToLottery: true})
        //     })
        this.setState({redirectToLottery: true})

    }

    render() {
        console.log(this.props);
        if (this.state.redirectToLottery) {
            return (
                <Redirect to='/lottery'/>
            )
        }
        return (
            <HomeStyle>
                        <div>
                            < Container >
                                < CurrentGame style={stylesCurrentGame}
                                              nrOfPlayers={this.props.committed}
                                              currentBet={this.props.fee}
                                              gameStatus={GAME_STATUS[this.props.currentPhase]}
                                              timestamps={this.props.timestamps}
                                />
                                <InputGroup inside style={styles}>
                                    <InputGroup.Addon>
                                        <Icon icon="avatar"/>
                                    </InputGroup.Addon>
                                    <Input  size = {'lg'} defaultValue = {this.props.user}
                                    disabled = {true}/>
                                </InputGroup>

                                <InputGroup style={styles}>
                                    <InputGroup.Addon>ETH</InputGroup.Addon>
                                    <Input size={'lg'}
                                           defaultValue = {this.props.fee}
                                            disabled = {true}
                                    />
                                </InputGroup>
                                <Button style={loginButtonStyle}
                                        color="yellow"
                                        onClick={this.joinLottery.bind(this)}>
                                    Join the Lottery
                                </Button>
                            </Container>
                        </div>
            </HomeStyle>
        );
    }
}

// const props = ({user})=>{
//     return {user}
// }

const mapStateToProps = (state, {user, committed, currentPhase, fee, web3, contract, cookies, timestamps}) => {
    return {
        isLoading: state.ui.isLoading,
        user,
        committed,
        currentPhase,
        fee,
        web3,
        contract,
        cookies,
        timestamps
    };
}

const mapActionsToProps = (dispatch) => {
    return {
        startLoading: ()=>dispatch(uiStartLoading()),
        stopLoading: ()=>dispatch(uiStopLoading()),
    }
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Home));
