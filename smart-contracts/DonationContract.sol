// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NordBalticDonations {
    address public adminWallet = 0xc7acc7c830aa381b6a7e7cf8baa9ddea6e576113;
    address public donationWallet = 0xfdb709e2bf745145fd8cd5f9130616a4c7865776;

    address public fund1 = 0x123456789abcdef123456789abcdef123456789a;
    address public fund2 = 0xabcdef123456789abcdef123456789abcdef12345;
    address public fund3 = 0x789abcdef123456789abcdef123456789abcdef12;

    uint256 public donationFee = 3; // 3% mokestis eina į donationWallet
    uint256 public fundSplit = 97; // Likusi 97% suma padalijama tarp 3 fondų

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsDistributed(uint256 fund1Share, uint256 fund2Share, uint256 fund3Share);

    function donate() external payable {
        require(msg.value > 0, "Must send some BNB to donate");

        uint256 feeAmount = (msg.value * donationFee) / 100;
        uint256 remainingAmount = msg.value - feeAmount;

        uint256 fund1Share = (remainingAmount * 33) / 100;
        uint256 fund2Share = (remainingAmount * 33) / 100;
        uint256 fund3Share = remainingAmount - fund1Share - fund2Share; // Kad nesikauptų netikslumai

        payable(donationWallet).transfer(feeAmount);
        payable(fund1).transfer(fund1Share);
        payable(fund2).transfer(fund2Share);
        payable(fund3).transfer(fund3Share);

        emit DonationReceived(msg.sender, msg.value);
        emit FundsDistributed(fund1Share, fund2Share, fund3Share);
    }

    function updateDonationWallet(address _newWallet) external {
        require(msg.sender == adminWallet, "Only admin can update wallet");
        donationWallet = _newWallet;
    }

    function updateFunds(address _fund1, address _fund2, address _fund3) external {
        require(msg.sender == adminWallet, "Only admin can update funds");
        fund1 = _fund1;
        fund2 = _fund2;
        fund3 = _fund3;
    }

    function updateDonationFee(uint256 _newFee) external {
        require(msg.sender == adminWallet, "Only admin can update fee");
        require(_newFee <= 10, "Fee can't be more than 10%");
        donationFee = _newFee;
        fundSplit = 100 - _newFee;
    }
}
