require("dotenv").config();
const { Web3 } = require("web3");
const hre = require("hardhat");

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

const issuersAddress = process.env.ARBISEPOLIA_ISSUERS_CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

async function interact() {
  try {
    const web3 = await new Web3(hre.config.networks.arbisepolia.url);
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

    async function multipleAddIssuer(addresses) {
      let batch = new web3.BatchRequest();
      for (let i = 0; i < addresses.length; i++) {
        batch.add(
          issuersContract.methods
            .addIssuer(addresses[i])
            .send({ from: publicKey, gasPrice: 10000000000 })
        );
      }
      batch.execute();
    }

    // await checkAuthorizedIssuer("0x921481ad4bd28ce58c858e6ecba1768fab5e6d7b");

    await addIssuer("0x2031832e54a2200bf678286f560f49a950db2ad5");

    // await checkAuthorizedIssuer("0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5");

    // await revokeIssuer("0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5");

    // await checkAuthorizedIssuer("0x921481ad4bd28ce58c858e6ecba1768fab5e6d7b");

    // await multipleAddIssuer([
    //   "0xf663792Be0EdD00AFFB8BBe4Ac6d8185efD5671d",
    //   "0x2B438781a968e6c30c0E2120e832015dD0808741",
    //   "0x377716067f8F46348069AD04D6b16De908fE0Af5",
    // ]);
  } catch (error) {
    console.error(error);
  }
}

interact();
