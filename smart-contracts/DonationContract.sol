// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DonationContract is Ownable, ReentrancyGuard {
    uint256 public donationFee = 3; // 3% fee
    address public adminWallet;

    event DonationReceived(address indexed donor, uint256 amount, string message);

    constructor(address _adminWallet) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        adminWallet = _adminWallet;
    }

    function donate(string memory message) external payable nonReentrant {
        require(msg.value > 0, "Donation must be greater than 0");

        uint256 feeAmount = (msg.value * donationFee) / 100;
        uint256 finalAmount = msg.value - feeAmount;

        payable(adminWallet).transfer(feeAmount);
        payable(adminWallet).transfer(finalAmount);

        emit DonationReceived(msg.sender, finalAmount, message);
    }

    function updateFee(uint256 _donationFee) external onlyOwner {
        require(_donationFee <= 5, "Max 5% fee");
        donationFee = _donationFee;
    }
}
