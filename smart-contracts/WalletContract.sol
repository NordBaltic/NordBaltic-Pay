// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract WalletContract is Ownable, ReentrancyGuard {
    uint256 public sendFee = 3; // 3% mokestis
    uint256 public adminFee = 2; // 2% eina adminui
    uint256 public stakingFee = 1; // 1% eina staking fondui
    address public adminWallet;
    address public stakingWallet;

    event FundsSent(address indexed sender, address indexed recipient, uint256 amount, uint256 fee);

    constructor(address _adminWallet, address _stakingWallet) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        require(_stakingWallet != address(0), "Invalid staking wallet");
        adminWallet = _adminWallet;
        stakingWallet = _stakingWallet;
    }

    function sendFunds(address payable recipient) external payable nonReentrant {
        require(msg.value > 0, "No funds sent");
        
        uint256 feeAmount = (msg.value * sendFee) / 100;
        uint256 adminAmount = (feeAmount * adminFee) / sendFee;
        uint256 stakingAmount = feeAmount - adminAmount;
        uint256 finalAmount = msg.value - feeAmount;

        payable(adminWallet).transfer(adminAmount);
        payable(stakingWallet).transfer(stakingAmount);
        recipient.transfer(finalAmount);

        emit FundsSent(msg.sender, recipient, finalAmount, feeAmount);
    }

    function updateFees(uint256 _sendFee, uint256 _adminFee, uint256 _stakingFee) external onlyOwner {
        require(_sendFee <= 5, "Max 5% fee");
        require(_adminFee + _stakingFee == _sendFee, "Fees must add up");
        sendFee = _sendFee;
        adminFee = _adminFee;
        stakingFee = _stakingFee;
    }

    function updateWallets(address _adminWallet, address _stakingWallet) external onlyOwner {
        require(_adminWallet != address(0) && _stakingWallet != address(0), "Invalid address");
        adminWallet = _adminWallet;
        stakingWallet = _stakingWallet;
    }
}
