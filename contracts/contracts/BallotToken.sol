// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BallotToken is ERC20, Ownable {
    uint256 public constant ONE_VOTE = 1 ether;

    mapping(address => bool) public hasReceivedBallot;

    event BallotIssued(address indexed voter);

    constructor() ERC20("Ballot", "BALLOT") Ownable(msg.sender) {}

    function issueBallot(address voter) external onlyOwner {
        require(!hasReceivedBallot[voter], "ballot already issued");
        hasReceivedBallot[voter] = true;
        _mint(voter, ONE_VOTE);
        emit BallotIssued(voter);
    }

    function issueBallots(address[] calldata voters) external onlyOwner {
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            if (hasReceivedBallot[voter]) continue;
            hasReceivedBallot[voter] = true;
            _mint(voter, ONE_VOTE);
            emit BallotIssued(voter);
        }
    }
}
