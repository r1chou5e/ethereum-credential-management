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
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    Issuers = await ethers.getContractFactory("Issuers");
    issuers = await Issuers.deploy();

    Certificates = await ethers.getContractFactory("Certificates");
    certificates = await Certificates.deploy(issuers.target);

    await issuers.addIssuer(addr1.address);
    await issuers.addIssuer(addr3.address);
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

  describe("revokeCertificate", function () {
    it("Should revoke a certificate", async function () {
      const issuer = addr1.address;
      const holder = addr2.address;
      const fileUrl = "http://example.com/certificate.pdf";
      const score = 90;
      const issueDate = Math.floor(Date.now() / 1000);
      const expireDate = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

      await certificates
        .connect(addr1)
        .issueCertificate(holder, fileUrl, score, expireDate);

      const event = await certificates.queryFilter("CertificateIssued");

      const certificateHash = event[0].args[5];

      await certificates
        .connect(addr1)
        .revokeCertificate(holder, certificateHash);

      const certificate = await certificates.getCertificateByHash(
        holder,
        certificateHash
      );

      expect(certificate.isRevoked).to.be.true;
    });

    it("Should revert if trying to revoke non-existent certificate", async function () {
      const holder = addr2.address;
      const nonExistentHash =
        "0x0000000000000000000000000000000000000000000000000000000000000000";

      await expect(
        certificates.connect(addr1).revokeCertificate(holder, nonExistentHash)
      ).to.be.revertedWith(
        "Only the issuer of this certificate can call this function"
      );
    });
  });

  describe("verifyCertificate", function () {
    it("Should return true for a valid and unrevoked certificate", async function () {
      const holder = addr2.address;
      const fileUrl = "http://example.com/certificate.pdf";
      const score = 90;
      const expireDate = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

      await certificates
        .connect(addr1)
        .issueCertificate(holder, fileUrl, score, expireDate);

      const event = await certificates.queryFilter("CertificateIssued");

      const certificateHash = event[0].args[5];

      const verified = await certificates.verifyCertificate(
        holder,
        certificateHash
      );

      expect(verified).to.be.true;
    });

    it("Should return false for a revoked certificate", async function () {
      const holder = addr2.address;
      const fileUrl = "http://example.com/certificate.pdf";
      const score = 90;
      const expireDate = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

      await certificates
        .connect(addr1)
        .issueCertificate(holder, fileUrl, score, expireDate);

      const event = await certificates.queryFilter("CertificateIssued");
      const certificateHash = event[0].args[5];

      await certificates
        .connect(addr1)
        .revokeCertificate(holder, certificateHash);

      const verified = await certificates.verifyCertificate(
        holder,
        certificateHash
      );

      expect(verified).to.be.false;
    });
  });

  describe("getCertificatesCount", function () {
    it("Should return the correct number of certificates for a holder", async function () {
      const holder = addr2.address;

      const fileUrl1 = "http://example.com/certificate1.pdf";
      const score1 = 90;
      const expireDate1 = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

      await certificates
        .connect(addr1)
        .issueCertificate(holder, fileUrl1, score1, expireDate1);

      const event1 = await certificates.queryFilter("CertificateIssued");
      const certificateHash1 = event1[0].args[5];

      const fileUrl2 = "http://example.com/certificate2.pdf";
      const score2 = 100;
      const expireDate2 = Math.floor(Date.now() / 1000) + 3600 + 3600; // Expires in 2 hour

      await certificates
        .connect(addr3)
        .issueCertificate(holder, fileUrl2, score2, expireDate2);

      const certificatesCount = await certificates.getCertificatesCount(holder);

      expect(certificatesCount).to.equal(2);

      await certificates
        .connect(addr1)
        .revokeCertificate(holder, certificateHash1);

      const certificatesCountAfterRevocation =
        await certificates.getCertificatesCount(holder);

      expect(certificatesCountAfterRevocation).to.equal(1);
    });

    it("Should revert if trying to revoke not owned certificate", async function () {
      const holder = addr2.address;

      const fileUrl1 = "http://example.com/certificate1.pdf";
      const score1 = 90;
      const expireDate1 = Math.floor(Date.now() / 1000) + 3600; // Expires in 1 hour

      await certificates
        .connect(addr1)
        .issueCertificate(holder, fileUrl1, score1, expireDate1);

      const event1 = await certificates.queryFilter("CertificateIssued");
      const certificateHash1 = event1[0].args[5];

      const fileUrl2 = "http://example.com/certificate2.pdf";
      const score2 = 100;
      const expireDate2 = Math.floor(Date.now() / 1000) + 3600 + 3600; // Expires in 2 hour

      await certificates
        .connect(addr3)
        .issueCertificate(holder, fileUrl2, score2, expireDate2);

      expect(
        await certificates
          .connect(addr1)
          .revokeCertificate(holder, certificateHash1)
      ).to.be.revertedWith(
        "Only the issuer of this certificate can call this function"
      );
    });
  });
});
