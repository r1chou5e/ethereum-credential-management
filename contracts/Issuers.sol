// SPDX-License-Identifier: UNLICENSED
pragma solidity <=0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Issuers is Ownable {
    mapping(address => bool) public authorizedIssuers;

    event IssuerAdded(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor(address _owner, address _issuer) Ownable(_owner) {
        authorizedIssuers[_issuer] = true;
    }

    function addIssuer(address issuer) private onlyOwner {
        require(!authorizedIssuers[issuer], "Issuer already exists");
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function revokeIssuer(address issuer) private onlyOwner {
        require(authorizedIssuers[issuer], "Issuer dosn't authorized");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
}
