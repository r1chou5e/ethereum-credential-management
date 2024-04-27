require("dotenv").config();
const { Web3 } = require("web3");

const issuersAbi = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
    ],
    name: "IssuerAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
    ],
    name: "IssuerRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "addIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "authorizedIssuers",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "issuer", type: "address" }],
    name: "revokeIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const issuersAddress = process.env.ISSUERS_CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

async function interact() {
  try {
    const web3 = await new Web3("https://rpc.sepolia.org");
    const issuersContract = new web3.eth.Contract(issuersAbi, issuersAddress);

    await web3.eth.accounts.wallet.add(privateKey);

    async function checkAuthorizedIssuer(address) {
      const isAuthorized = await issuersContract.methods
        .authorizedIssuers(address)
        .call();
      console.log(`${address} is authorized issuer: ${isAuthorized}`);
    }

    async function addIssuer(address) {
      const receipt = await issuersContract.methods
        .addIssuer(address)
        .send({ from: publicKey, gasPrice: 10000000000 });
      console.log("Add issuer transaction receipt:", receipt);
    }

    async function revokeIssuer(address) {
      const receipt = await issuersContract.methods
        .revokeIssuer(address)
        .send({ from: publicKey, gasPrice: 10000000000 });
      console.log("Revoke issuer transaction receipt:", receipt);
    }

    await addIssuer("0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5");

    await checkAuthorizedIssuer("0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5");

    await revokeIssuer("0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5");

    await checkAuthorizedIssuer("0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5");
  } catch (error) {
    console.error(error);
  }
}

interact();
