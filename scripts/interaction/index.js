require("dotenv").config();
const { Web3 } = require("web3");
const hre = require("hardhat");
const { checkAuthorizedIssuer, issuersAbi } = require("./issuers");
const { certificatesAbi } = require("./certificates");

let issuersAddress, certificatesAddress, web3;
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

async function interact(network, contractName) {
  issuersAddress =
    network === "ethsepolia"
      ? process.env.ETHSEPOLIA_ISSUERS_CONTRACT_ADDRESS
      : process.env.ARBISEPOLIA_ISSUERS_CONTRACT_ADDRESS;
  certificatesAddress =
    network === "ethsepolia"
      ? process.env.ETHSEPOLIA_CERTIFICATES_CONTRACT_ADDRESS
      : process.env.ARBISEPOLIA_CERTIFICATES_CONTRACT_ADDRESS;
  web3 = await new Web3(
    network === "ethsepolia"
      ? hre.config.networks.ethsepolia.url
      : hre.config.networks.arbisepolia.url
  );
  const contract =
    contractName === "issuers"
      ? new web3.eth.Contract(issuersAbi, issuersAddress)
      : new web3.eth.Contract(certificatesAbi, certificatesAddress);
  try {
  } catch (error) {}
}
