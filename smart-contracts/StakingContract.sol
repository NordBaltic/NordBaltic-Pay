// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMarinadeStaking {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

contract StakingContract {
    address public admin;
    address public stakeWallet;
    address public marinadeStakingContract;
    uint256 public depositFee = 4; // 4% įnešimo mokestis
    uint256 public withdrawalFee = 4; // 4% išėmimo mokestis

    mapping(address => uint256) public userStakedAmount;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event FeesCollected(address indexed stakeWallet, uint256 amount);

    constructor(address _marinadeStakingContract, address _stakeWallet) {
        admin = msg.sender;
        marinadeStakingContract = _marinadeStakingContract;
        stakeWallet = _stakeWallet;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function stake() external payable {
        require(msg.value > 0, "Amount must be greater than 0");

        // Apskaičiuojami įnešimo mokesčiai
        uint256 feeAmount = (msg.value * depositFee) / 100;
        uint256 stakeAmount = msg.value - feeAmount;

        // Mokesčiai siunčiami į stake wallet
        payable(stakeWallet).transfer(feeAmount);

        // Likutis pervedamas tiesiai į Marinade Finance staking
        IMarinadeStaking(marinadeStakingContract).deposit{value: stakeAmount}();

        userStakedAmount[msg.sender] += stakeAmount;

        emit FeesCollected(stakeWallet, feeAmount);
        emit Staked(msg.sender, stakeAmount);
    }

    function unstake(uint256 amount) external {
        require(userStakedAmount[msg.sender] >= amount, "Insufficient balance");

        // Apskaičiuojami išėmimo mokesčiai
        uint256 feeAmount = (amount * withdrawalFee) / 100;
        uint256 withdrawAmount = amount - feeAmount;

        // Išimama iš staking
        IMarinadeStaking(marinadeStakingContract).withdraw(amount);

        // Mokesčiai siunčiami į stake wallet
        payable(stakeWallet).transfer(feeAmount);

        // Likutis atiduodamas vartotojui
        payable(msg.sender).transfer(withdrawAmount);

        userStakedAmount[msg.sender] -= amount;

        emit FeesCollected(stakeWallet, feeAmount);
        emit Unstaked(msg.sender, withdrawAmount);
    }

    function updateMarinadeContract(address newContract) external onlyAdmin {
        marinadeStakingContract = newContract;
    }

    function updateFees(uint256 newDepositFee, uint256 newWithdrawalFee) external onlyAdmin {
        require(newDepositFee <= 10 && newWithdrawalFee <= 10, "Fees too high!");
        depositFee = newDepositFee;
        withdrawalFee = newWithdrawalFee;
    }

    function updateStakeWallet(address newStakeWallet) external onlyAdmin {
        stakeWallet = newStakeWallet;
    }

    receive() external payable {} // Priima BNB indėlius
}
