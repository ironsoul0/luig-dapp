pragma solidity ^0.5.0;

contract Game {
  struct Player {
    string name;
    uint choice;
    address payable wallet;
  }

  bool public started = false;
  address public owner;
  Player[] public players;
  mapping (uint => uint) counter;

  constructor() public {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function joinGame(string memory name, uint choice) public payable {
    require(msg.value == 1 ether && !started && choice > 0);
    Player memory currentPlayer = Player(name, choice, msg.sender);
    players.push(currentPlayer);
  }

  event WinnerAnnounced(string name, uint choice);
  event NoWinner();

  function startGame() public onlyOwner { 
    require(!started && players.length > 0);
    started = true;
    
    uint result = 0;
    uint currentMinimum = 0;

    for (uint i = 0; i < players.length; i++) {
      if (players[i].choice > currentMinimum) currentMinimum = players[i].choice;
      counter[players[i].choice]++;
    }

    for (uint i = 0; i < players.length; i++) {
      if (counter[players[i].choice] == 1) {
        if (currentMinimum == 0 || players[i].choice < currentMinimum) {
          currentMinimum = players[i].choice;
          result = i + 1;
        }
      }
    }

    for (uint i = 0; i < players.length; i++) {
      counter[players[i].choice]--;
    }

    if (result > 0) {
      Player memory winner = players[result];

      emit WinnerAnnounced(winner.name, winner.choice);
      address(winner.wallet).transfer(address(this).balance); 
    } else {
      emit NoWinner();
    }

    delete players;
    started = false;
  }
}