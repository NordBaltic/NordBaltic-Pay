// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract WalletContract is Ownable {
    address public adminWallet = 0xc7acc7c830aa381b6a7e7cf8baa9ddea6e576113;
    IUniswapV2Router02 public uniswapRouter;
    
    uint256 public transferFee = 300;  // 3% (300 basis points)
    uint256 public swapFee = 20;       // 0.2% (20 basis points)
    
    event TransferFeeTaken(address indexed user, uint256 feeAmount);
    event TokensSwapped(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event FeeCollected(address indexed admin, uint256 amount);

    constructor(address _uniswapRouter) {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    modifier onlyAdmin() {
        require(msg.sender == owner(), "Only admin can call this");
        _;
    }
    
    function setAdminWallet(address _newAdminWallet) external onlyAdmin {
        adminWallet = _newAdminWallet;
    }

    function setTransferFee(uint256 _newFee) external onlyAdmin {
        require(_newFee <= 1000, "Max fee is 10%");
        transferFee = _newFee;
    }

    function setSwapFee(uint256 _newFee) external onlyAdmin {
        require(_newFee <= 100, "Max fee is 1%");
        swapFee = _newFee;
    }

    function transferTokens(address _token, address _to, uint256 _amount) external {
        IERC20 token = IERC20(_token);
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient balance");

        uint256 feeAmount = (_amount * transferFee) / 10000;
        uint256 amountAfterFee = _amount - feeAmount;

        require(token.transferFrom(msg.sender, adminWallet, feeAmount), "Admin fee transfer failed");
        require(token.transferFrom(msg.sender, _to, amountAfterFee), "Transfer failed");

        emit TransferFeeTaken(msg.sender, feeAmount);
    }

    function swapTokens(
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) external {
        require(_amount > 0, "Amount must be greater than 0");

        IERC20 tokenIn = IERC20(_tokenIn);
        require(tokenIn.balanceOf(msg.sender) >= _amount, "Insufficient balance");

        uint256 feeAmount = (_amount * swapFee) / 10000;
        uint256 amountAfterFee = _amount - feeAmount;

        require(tokenIn.transferFrom(msg.sender, adminWallet, feeAmount), "Fee transfer failed");
        require(tokenIn.transferFrom(msg.sender, address(this), amountAfterFee), "Transfer failed");

        tokenIn.approve(address(uniswapRouter), amountAfterFee);

        address;
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory amounts = uniswapRouter.swapExactTokensForTokens(
            amountAfterFee,
            0, 
            path,
            msg.sender,
            block.timestamp + 300
        );

        emit TokensSwapped(msg.sender, _tokenIn, _tokenOut, _amount, amounts[1]);
        emit FeeCollected(adminWallet, feeAmount);
    }
}
