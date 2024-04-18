// SPDX-License-Identifier: UNLICENSED
pragma solidity <=0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Issuers is Ownable {
    mapping(address => bool) public authorizedIssuers;

    event IssuerAdded(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() Ownable(msg.sender) {
        authorizedIssuers[msg.sender] = true;
    }

    function addIssuer(address issuer) public onlyOwner {
        require(!authorizedIssuers[issuer], "Issuer already exists");
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function revokeIssuer(address issuer) public onlyOwner {
        require(authorizedIssuers[issuer], "Issuer dosn't authorized");
        authorizedIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }
}
