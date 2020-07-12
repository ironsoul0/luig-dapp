const SocialNetwork = artifacts.require("SocialNetwork");
const Game = artifacts.require("Game");

module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
  deployer.deploy(Game);
};
