// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZicronToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18;
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    constructor(address initialOwner)
        ERC20("Zicron", "ZCR")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "MAX_SUPPLY_EXCEEDED");
        _mint(to, amount);
    }
}
