const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Issuers", function () {
  let Issuers;
  let issuers;
  let owner;
  let address1;
  let address2;

  beforeEach(async function () {
    [owner, address1, address2] = await ethers.getSigners();
    Issuers = await ethers.getContractFactory("Issuers");
    issuers = await Issuers.deploy();
  });

  it("Should deploy with the owner as an authorized issuer", async function () {
    expect(await issuers.authorizedIssuers(owner.address)).to.equal(true);
  });

  it("Should add a new issuer", async function () {
    await issuers.connect(owner).addIssuer(address1.address);
    expect(await issuers.authorizedIssuers(address1.address)).to.equal(true);
    expect(await issuers.authorizedIssuers(address2.address)).to.equal(false);
  });

  it("Should revoke an issuer", async function () {
    await issuers.connect(owner).addIssuer(address1.address);
    expect(await issuers.authorizedIssuers(address1.address)).to.equal(true);
    await issuers.connect(owner).revokeIssuer(address1.address);
    expect(await issuers.authorizedIssuers(address1.address)).to.equal(false);
  });

  it("Should not allow adding an existing issuer", async function () {
    await issuers.connect(owner).addIssuer(address1.address);
    await expect(
      issuers.connect(owner).addIssuer(address1.address)
    ).to.be.revertedWith("Issuer already exists");
  });

  it("Should not allow revoking a non-existing issuer", async function () {
    await expect(
      issuers.connect(owner).revokeIssuer(address2.address)
    ).to.be.revertedWith("Issuer dosn't authorized");
  });

  it("Should revert when non-owner try to add or revoke an issuer", async function () {
    await expect(issuers.connect(address1).addIssuer(address2.address)).to.be
      .reverted;
    await expect(issuers.connect(address1).revokeIssuer(address2.address)).to.be
      .reverted;
  });
});
