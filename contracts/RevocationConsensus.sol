// SPDX-License-Identifier: UNLICENSED
pragma solidity <=0.8.25;

import "./Certificates.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RevocationConsensus is Ownable {
    struct PendingRevocation {
        address holder;
        bytes32 certificateHash;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    Certificates private certificatesContract;
    mapping(bytes32 => PendingRevocation) public pendingRevocations;
    address[] public members;

    event RevocationRequested(
        address indexed holder,
        bytes32 indexed certificateHash
    );
    event RevocationApproved(
        address indexed member,
        address indexed holder,
        bytes32 indexed certificateHash
    );
    event CertificateRevoked(
        address indexed holder,
        bytes32 indexed certificateHash
    );

    modifier onlyMember() {
        require(isMember(msg.sender), "Only members can call this function");
        _;
    }

    constructor(
        address _certificatesContractAddress,
        address _owner
    ) Ownable(_owner) {
        certificatesContract = Certificates(_certificatesContractAddress);
    }

    function addMember(address _member) external onlyOwner {
        members.push(_member);
    }

    function isMember(address _member) public view returns (bool) {
        for (uint i = 0; i < members.length; i++) {
            if (members[i] == _member) {
                return true;
            }
        }
        return false;
    }

    function requestRevocation(
        address _holder,
        bytes32 _certificateHash
    ) external onlyMember {
        require(
            certificatesContract.verifyCertificate(_holder, _certificateHash),
            "Certificate is not valid or already revoked"
        );
        bytes32 revocationHash = keccak256(
            abi.encode(_holder, _certificateHash)
        );

        PendingRevocation storage revocation = pendingRevocations[
            revocationHash
        ];
        require(
            revocation.holder == address(0),
            "Revocation already requested"
        );

        revocation.holder = _holder;
        revocation.certificateHash = _certificateHash;
        revocation.approvalCount = 0;

        emit RevocationRequested(_holder, _certificateHash);
    }

    function approveRevocation(
        address _holder,
        bytes32 _certificateHash
    ) external onlyMember {
        bytes32 revocationHash = keccak256(
            abi.encode(_holder, _certificateHash)
        );
        PendingRevocation storage revocation = pendingRevocations[
            revocationHash
        ];
        require(revocation.holder != address(0), "Revocation not requested");
        require(
            !revocation.approvals[msg.sender],
            "Already approved by this member"
        );

        revocation.approvals[msg.sender] = true;
        revocation.approvalCount += 1;

        emit RevocationApproved(msg.sender, _holder, _certificateHash);

        if (revocation.approvalCount >= members.length / 2) {
            certificatesContract.revokeCertificate(_holder, _certificateHash);
            emit CertificateRevoked(_holder, _certificateHash);
        }
    }
}
