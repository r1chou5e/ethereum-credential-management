// SPDX-License-Identifier: UNLICENSED
pragma solidity <=0.8.24;

import "./Issuers.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Certificates {
    struct Certificate {
        address holder;
        address issuer;
        string fileUrl;
        bytes32 fileHash;
        uint256 issueDate;
        uint256 expireDate;
        bool isRevoked;
    }

    Issuers private issuers;

    mapping(address => mapping(bytes32 => Certificate)) public certificates;
    mapping(address => uint256) public certificatesCount;

    constructor(address _issuerContractAddress) payable {
        issuers = Issuers(_issuerContractAddress);
    }

    event CertificateIssued(
        address indexed _holder,
        address indexed _issuer,
        string _fileUrl,
        uint _issueDate,
        uint _expireDate
    );

    event RevokedCertificate(
        address indexed _issuer,
        address indexed _holder,
        bytes32 _certificateHash
    );

    modifier onlyIssuer() {
        require(
            issuers.authorizedIssuers[msg.sender],
            "Only authorized issuers can call this function"
        );
        _;
    }

    function issueCertificate(
        address _holder,
        string memory _fileUrl,
        bytes32 _fileHash,
        uint _expireDate
    ) public onlyIssuer returns (bytes32) {
        bytes32 certificateHash = keccak256(
            abi.encodePacked(_holder, _fileUrl, _fileHash, _expireDate)
        );
        require(
            certificates[_holder][certificateHash].holder == address(0),
            "Certificate already exists"
        );

        certificates[_holder][certificateHash] = Certificate(
            _holder,
            msg.sender,
            _fileUrl,
            _fileHash,
            block.timestamp,
            _expireDate,
            false
        );

        certificatesCount[_holder]++;

        emit CertificateIssued(
            _holder,
            msg.sender,
            _fileUrl,
            block.timestamp,
            _expireDate
        );

        return certificateHash;
    }

    function revokeCertificate(
        address _holder,
        byte32 _certificateHash
    ) external onlyIssuer returns (bool) {
        require(
            certificates[_holder][_certificateHash].holder != address(0),
            "Certificate does not exist"
        );

        certificates[_holder][_certificateHash].isRevoked = true;

        emit RevokedCertificate(msg.sender, _holder, _certificateHash);

        return true;
    }

    function verifyCertificate(
        address _holder,
        bytes32 _certificateHash,
        bytes32 _fileHash
    ) external view returns (bool) {
        return
            !certificates[_holder][_certificateHash].isRevoked &&
            certificates[_holder][_certificateHash].fileHash == _fileHash &&
            certificates[_holder][_certificateHash].expireDate >
            block.timestamp;
    }

    function getCertificateByHash(
        address _holder,
        bytes32 _certificateHash
    ) external view returns (Certificate memory) {
        return certificates[_holder][_certificateHash];
    }

    function getCertificatesCount(
        address _holder
    ) external view returns (uint256) {
        return certificatesCount[_holder];
    }

    function getCertificateByFileHash(
        address _holder,
        bytes32 _fileHash
    ) external view returns (Certificate memory) {
        for (uint256 i = 0; i < certificatesCount[_holder]; i++) {
            Certificate memory certificate = certificates[_holder][i];
            if (certificate.fileHash == _fileHash) {
                return certificate;
            }
        }
    }
}
