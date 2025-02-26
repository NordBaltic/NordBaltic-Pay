// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NordBalticStaking {
    address public adminWallet = 0xc7acc7c830aa381b6a7e7cf8baa9ddea6e576113;
    address public stakeWallet = 0x80131a0ec0d5e093964c267aa00d0c6956e064a7;
    uint256 public stakingFee = 4; // 4% staking fee į stake wallet
    uint256 public adminFee = 4; // 4% admin fee

    mapping(address => uint256) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    function stake() external payable {
        require(msg.value > 0, "Must send BNB to stake");

        uint256 feeAmount = (msg.value * stakingFee) / 100;
        uint256 adminAmount = (msg.value * adminFee) / 100;
        uint256 netStake = msg.value - feeAmount - adminAmount;

        stakes[msg.sender] += netStake;

        payable(stakeWallet).transfer(feeAmount);
        payable(adminWallet).transfer(adminAmount);

        emit Staked(msg.sender, netStake);
    }

    function unstake(uint256 _amount) external {
        require(stakes[msg.sender] >= _amount, "Not enough staked");

        stakes[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);

        emit Unstaked(msg.sender, _amount);
    }

    function updateStakeWallet(address _newStakeWallet) external {
        require(msg.sender == adminWallet, "Only admin can update address");
        stakeWallet = _newStakeWallet;
    }

    function updateStakingFee(uint256 _newFee) external {
        require(msg.sender == adminWallet, "Only admin can update fee");
        require(_newFee <= 10, "Fee can't be more than 10%");
        stakingFee = _newFee;
    }
}
