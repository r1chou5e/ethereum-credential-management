require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    ethsepolia: {
      url: "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY],
    },
    arbisepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    // apiKey: process.env.ETHERSCAN_API_KEY,
    apiKey: process.env.ARBISCAN_API_KEY,
  },
};
