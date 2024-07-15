const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account: ', deployer.address);

  console.log(
    'Account balance: ',
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  const Issuers = await ethers.getContractFactory('Issuers');
  const issuers = await Issuers.deploy();

  console.log('Issuers contract address: ', issuers.target);

  const Certificates = await ethers.getContractFactory('Certificates');
  const certificates = await Certificates.deploy(issuers.target);

  console.log('Certificates contract address: ', certificates.target);

  const RevocationConsensus = await ethers.getContractFactory(
    'RevocationConsensus'
  );
  const revocationConsensus = await RevocationConsensus.deploy(
    certificates.target,
    deployer.address
  );

  console.log(
    'RevocationConsensus contract address: ',
    revocationConsensus.target
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
