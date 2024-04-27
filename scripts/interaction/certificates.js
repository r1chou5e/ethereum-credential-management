require("dotenv").config();
const { Web3 } = require("web3");

const certificateAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_issuerContractAddress",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_holder",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "_fileUrl",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_issueDate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "_expireDate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "_certificateHash",
        type: "bytes32",
      },
    ],
    name: "CertificateIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_issuer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "_holder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "_certificateHash",
        type: "bytes32",
      },
    ],
    name: "RevokedCertificate",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "bytes32", name: "", type: "bytes32" },
    ],
    name: "certificates",
    outputs: [
      { internalType: "address", name: "holder", type: "address" },
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "string", name: "fileUrl", type: "string" },
      { internalType: "uint16", name: "score", type: "uint16" },
      { internalType: "uint256", name: "issueDate", type: "uint256" },
      { internalType: "uint256", name: "expireDate", type: "uint256" },
      { internalType: "bool", name: "isRevoked", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "certificatesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_holder", type: "address" },
      { internalType: "bytes32", name: "_certificateHash", type: "bytes32" },
    ],
    name: "getCertificateByHash",
    outputs: [
      {
        components: [
          { internalType: "address", name: "holder", type: "address" },
          { internalType: "address", name: "issuer", type: "address" },
          { internalType: "string", name: "fileUrl", type: "string" },
          { internalType: "uint16", name: "score", type: "uint16" },
          { internalType: "uint256", name: "issueDate", type: "uint256" },
          { internalType: "uint256", name: "expireDate", type: "uint256" },
          { internalType: "bool", name: "isRevoked", type: "bool" },
        ],
        internalType: "struct Certificates.Certificate",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_holder", type: "address" }],
    name: "getCertificatesCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_holder", type: "address" },
      { internalType: "string", name: "_fileUrl", type: "string" },
      { internalType: "uint16", name: "_score", type: "uint16" },
      { internalType: "uint256", name: "_expireDate", type: "uint256" },
    ],
    name: "issueCertificate",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_holder", type: "address" },
      { internalType: "bytes32", name: "_certificateHash", type: "bytes32" },
    ],
    name: "revokeCertificate",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_holder", type: "address" },
      { internalType: "bytes32", name: "_certificateHash", type: "bytes32" },
    ],
    name: "verifyCertificate",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

const certificatesAddress = process.env.CERTIFICATES_CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

async function interact() {
  try {
    const web3 = await new Web3("https://rpc.sepolia.org");
    const certificatesContract = new web3.eth.Contract(
      certificateAbi,
      certificatesAddress
    );

    await web3.eth.accounts.wallet.add(privateKey);

    async function issueCertificate(holder, fileUrl, score, expireDate) {
      const gas = await certificatesContract.methods
        .issueCertificate(holder, fileUrl, score, expireDate)
        .estimateGas({ from: publicKey });

      const receipt = await certificatesContract.methods
        .issueCertificate(holder, fileUrl, score, expireDate)
        .send({
          from: publicKey,
          gas: gas,
        });

      console.log(
        "Certificate issued successfully with transaction hash:",
        receipt.transactionHash
      );

      return receipt.events.CertificateIssued.returnValues._certificateHash;
    }

    async function revokeCertificate(holder, certificateHash) {
      const gas = await certificatesContract.methods
        .revokeCertificate(holder, certificateHash)
        .estimateGas({ from: publicKey });

      const receipt = await certificatesContract.methods
        .revokeCertificate(holder, certificateHash)
        .send({
          from: publicKey,
          gas: gas,
        });

      console.log(
        "Certificate revoked successfully with transaction hash:",
        receipt.transactionHash
      );
      return receipt.events.RevokedCertificate.returnValues._certificateHash;
    }

    async function getCertificateByHash(holder, certificateHash) {
      const certificate = await certificatesContract.methods
        .getCertificateByHash(holder, certificateHash)
        .call();
      return certificate;
    }

    async function getCertificatesCount(holder) {
      const count = await certificatesContract.methods
        .getCertificatesCount(holder)
        .call();
      return count;
    }

    const holder = "0xb2248390842d3C4aCF1D8A893954Afc0EAc586e5";
    const fileUrl = "https://example.com/certificate.pdf";
    const score = 83;
    const expireDate = Math.floor(Date.now() / 1000) + 3600 * 24 * 365 * 2; // 2 year

    const certificateHash = await issueCertificate(
      holder,
      fileUrl,
      score,
      expireDate
    );
    console.log("Certificate hash:", certificateHash);

    const certificate = await getCertificateByHash(holder, certificateHash);
    console.log("Certificate retrieved successfully:", certificate);

    const count1 = await getCertificatesCount(holder);
    console.log(`Certificates count of ${holder}: `, count1);

    const revokedCertificateHash = await revokeCertificate(
      holder,
      "0x3987071f0d7dee0e6dfab42e0f36fd004331f3e3810530bfe876c30f2c25a22f"
    );
    console.log("Certificate hash:", revokedCertificateHash);

    const count2 = await getCertificatesCount(holder);
    console.log(`Certificates count of ${holder}: `, count2);
  } catch (error) {
    console.error(error);
  }
}

interact();
