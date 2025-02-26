// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract StakingContract is Ownable, ReentrancyGuard {
    uint256 public entryFee = 5; // 5% staking fee
    uint256 public exitFee = 5; // 5% unstake fee
    address public adminWallet;

    mapping(address => uint256) public stakedBalances;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    constructor(address _adminWallet) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        adminWallet = _adminWallet;
    }

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Stake amount must be greater than 0");

        uint256 feeAmount = (msg.value * entryFee) / 100;
        uint256 stakedAmount = msg.value - feeAmount;

        payable(adminWallet).transfer(feeAmount);
        stakedBalances[msg.sender] += stakedAmount;

        emit Staked(msg.sender, stakedAmount);
    }

    function unstake(uint256 amount) external nonReentrant {
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");

        uint256 feeAmount = (amount * exitFee) / 100;
        uint256 finalAmount = amount - feeAmount;

        stakedBalances[msg.sender] -= amount;
        payable(adminWallet).transfer(feeAmount);
        payable(msg.sender).transfer(finalAmount);

        emit Unstaked(msg.sender, finalAmount);
    }

    function updateFees(uint256 _entryFee, uint256 _exitFee) external onlyOwner {
        require(_entryFee <= 10 && _exitFee <= 10, "Max 10% fee");
        entryFee = _entryFee;
        exitFee = _exitFee;
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(adminWallet).transfer(amount);
    }
}
