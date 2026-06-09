// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Election {
    IERC20 public immutable ballot;
    address public immutable authority;
    string public name;

    address[] public candidates;
    mapping(address => string) public candidateName;
    mapping(address => bool) public isCandidate;

    event CandidateAdded(address indexed candidate, string name);

    constructor(IERC20 _ballot, string memory _name) {
        ballot = _ballot;
        authority = msg.sender;
        name = _name;
    }

    modifier onlyAuthority() {
        require(msg.sender == authority, "not authority");
        _;
    }

    function addCandidate(address candidate, string calldata candidateName_)
        external
        onlyAuthority
    {
        require(!isCandidate[candidate], "already a candidate");
        isCandidate[candidate] = true;
        candidateName[candidate] = candidateName_;
        candidates.push(candidate);
        emit CandidateAdded(candidate, candidateName_);
    }

    function candidateCount() external view returns (uint256) {
        return candidates.length;
    }

    function votesFor(address candidate) external view returns (uint256) {
        return ballot.balanceOf(candidate);
    }

    function results()
        external
        view
        returns (address[] memory addrs, uint256[] memory voteCounts)
    {
        addrs = candidates;
        voteCounts = new uint256[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            voteCounts[i] = ballot.balanceOf(candidates[i]);
        }
    }
}
