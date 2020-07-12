pragma solidity ^0.5.16;

contract Game {
  struct Player {
    string name;
    uint choice;
    address payable wallet;
  }

  uint public playerCount = 0;
  bool public started = false;
  address public owner;
  mapping (uint => Player) public players;
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
    playerCount += 1;
    players[playerCount] = currentPlayer;
  }

  event WinnerAnnounced(string name, uint choice);
  event NoWinner();
  event GameStarted();

  function isOwner() public view returns (bool) {
    return (msg.sender == owner);
  }

  function causeEvent() public {
    emit GameStarted();
  }

  function startGame() public onlyOwner { 
    require(!started);
    require(playerCount != 0);
    started = true;

    emit GameStarted();
    
    uint result = 0;
    uint currentMinimum = 0;

    for (uint i = 1; i <= playerCount; i++) {
      if (players[i].choice > currentMinimum) currentMinimum = players[i].choice;
      counter[players[i].choice]++;
    }

    for (uint i = 1; i <= playerCount; i++) {
      if (counter[players[i].choice] == 1) {
        if (currentMinimum == 0 || players[i].choice < currentMinimum) {
          currentMinimum = players[i].choice;
          result = i;
        }
      }
    }

    for (uint i = 1; i <= playerCount; i++) {
      counter[players[i].choice]--;
    }

    if (result > 0) {
      Player memory winner = players[result];

      emit WinnerAnnounced(winner.name, winner.choice);
      address(winner.wallet).transfer(address(this).balance); 
    } else {
      emit NoWinner();
    }

    started = false;
    playerCount = 0;
  }
}