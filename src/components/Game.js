import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json'
import Game from '../abis/Game.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  startGame = async () => {
    await this.state.game.methods.startGame().send({ from: this.state.account });
  }

  fetchPlayers = async () => {
    const playerCount = await this.state.game.methods.playerCount().call();
    console.log("cnt", playerCount, this.state.isStarted);
    const players = [];
    for (let i = 1; i <= playerCount; i++) {
      players.push(this.state.game.methods.players(i).call());
    }
    const resolved = await Promise.all(players);
    console.log(resolved);
    this.setState({
      players: resolved
    })
    //this.state.game.methods.joinGame("ironsoul", 5).send({ from: this.state.account, value: window.web3.utils.toWei('1', 'Ether') })
  }

  gameStartedHandler = () => {
    this.state.game.events.GameStarted({}, function (error, event){ 
      console.log(event, error) 
    })      // await game.methods.emitEvent('hey').send({from: accounts[0]})
  }

  winnerAnnouncedHandler = () => {

  }

  noWinnerHandler = () => {

  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = Game.networks[networkId]
    if(networkData) {
      const game = new web3.eth.Contract(Game.abi, networkData.address)
      // const players = await game.methods.players().call();
      //game.methods.joinGame("ironsoul", 5).send({ from: this.state.account, value: window.web3.utils.toWei('1', 'Ether') })
      // console.log(await game.methods.players(1).call())
      // console.log("started " ,players);
      const isOwner = await game.methods.owner.call();
      const isStarted = await game.methods.started().call();


     
      this.setState({ game, loading: false, isOwner: isOwner === accounts[0], isStarted })
      this.gameStartedHandler();
      await this.fetchPlayers();
      await this.winnerAnnouncedHandler();
      await this.noWinnerHandler();
    } else {
      window.alert('Game contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      game: null,
      loading: true,
      isOwner: false,
      isStarted: false,
      players: []
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : (
            <>
            <h1 style={{marginTop: "100px"}}>
              Game
            </h1>
            <div>
              <input type="text" placeholder="name" />
            </div>
            {this.state.isOwner && <button onClick={this.startGame}>Start game</button>}
            </>
          ) 
        }
      </div>
    );
  }
}

export default App;
