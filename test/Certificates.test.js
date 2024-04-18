const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Certificates", function () {
  let Certificates;
  let certificates;
  let Issuers;
  let issuers;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    Issuers = await ethers.getContractFactory("Issuers");
    issuers = await Issuers.deploy();

    Certificates = await ethers.getContractFactory("Certificates");
    certificates = await Certificates.deploy(issuers.target);

    await issuers.addIssuer(addr1.address);
  });

  describe("issueCertificate", function () {
    it("Should issue a certificate", async function () {
      const issuer = addr1.address;
      const holder = addr2.address;
      const fileUrl = "http://example.com/certificate.pdf";
      const score = 90;
      const issueDate = Math.floor(Date.now() / 1000);
      const expireDate = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

      const tx = await certificates
        .connect(addr1)
        .issueCertificate(holder, fileUrl, score, expireDate);

      expect(await tx.wait())
        .to.emit(certificates, "CertificateIssued")
        .withArgs(holder, issuer, fileUrl, issueDate, expireDate);

      const event = await certificates.queryFilter("CertificateIssued");

      const certificateHash = event[0].args[5];

      const certificate = await certificates.getCertificateByHash(
        holder,
        certificateHash
      );

      expect(certificate.holder).to.equal(holder);
      expect(certificate.issuer).to.equal(issuer);
      expect(certificate.fileUrl).to.equal(fileUrl);
      expect(certificate.score).to.equal(score);
      expect(certificate.expireDate).to.equal(expireDate);
      expect(certificate.isRevoked).to.be.false;

      const certificatesCount = await certificates.getCertificatesCount(holder);
      expect(certificatesCount).to.equal(1);
    });
  });
});
