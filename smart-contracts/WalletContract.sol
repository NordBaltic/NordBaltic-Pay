// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NordBalticWallet {
    address public adminWallet = 0xc7acc7c830aa381b6a7e7cf8baa9ddea6e576113;
    uint256 public transactionFee = 3; // 3% mokesčiai

    mapping(address => uint256) public balances;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event FeeTaken(address indexed from, uint256 fee);

    function sendFunds(address payable _to, uint256 _amount) external payable {
        require(msg.value >= _amount, "Not enough funds sent!");

        uint256 fee = (_amount * transactionFee) / 100;
        uint256 netAmount = _amount - fee;

        balances[_to] += netAmount;
        balances[adminWallet] += fee;

        emit Transfer(msg.sender, _to, netAmount);
        emit FeeTaken(msg.sender, fee);

        _to.transfer(netAmount);
        payable(adminWallet).transfer(fee);
    }

    function updateAdminWallet(address _newAdmin) external {
        require(msg.sender == adminWallet, "Only admin can update address");
        adminWallet = _newAdmin;
    }

    function updateTransactionFee(uint256 _newFee) external {
        require(msg.sender == adminWallet, "Only admin can update fee");
        require(_newFee <= 10, "Fee can't be more than 10%");
        transactionFee = _newFee;
    }
}
