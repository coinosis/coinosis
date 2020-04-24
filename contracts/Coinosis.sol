pragma solidity 0.5.16;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Coinosis {

    using SafeMath for uint;

    string constant NOT_OWNER = "The sender account is not the owner \
(not-owner)";
    string constant INVALID_ETH_PRICE = "The provided ETH price is invalid \
(invalid-eth-price)";
    string constant NAMES_DIFFER_ADDRESSES =
        "The amount of names differs from the amount of addresses \
(names-differ-addresses)";
    string constant ADDRESSES_DIFFER_CLAPS =
        "The amount of addresses differs from the amount of claps \
(addresses-differ-claps)";
    string constant INSUFFICIENT_VALUE =
        "The ether value in this contract is less than the total reward value \
to send (insufficient-value)";

    string public version = "1.1.0";
    address payable private owner;

    event Assessment(
        uint timestamp,
        uint registrationFeeUSDWei,
        uint ETHPriceUSDWei,
        string[] names,
        address payable[] addresses,
        uint[] claps,
        uint registrationFeeWei,
        uint totalFeesWei,
        uint totalClaps,
        uint[] rewards
    );
    event Transfer(
        string name,
        address addr,
        uint registrationFeeUSDWei,
        uint registrationFeeWei,
        uint claps,
        uint reward
    );
    event RewardedAmount(uint rewardedAmount);

    constructor () public {
        owner = msg.sender;
    }

    function () external payable {}

    function decommission() public {
        require(msg.sender == owner, NOT_OWNER);
        selfdestruct(owner);
    }

    function assess(
        uint registrationFeeUSDWei,
        uint ETHPriceUSDWei,
        string[] memory names,
        address payable[] memory addresses,
        uint[] memory claps
    ) public {
        require(msg.sender == owner, NOT_OWNER);
        require(ETHPriceUSDWei > 0, INVALID_ETH_PRICE);
        require(names.length == addresses.length, NAMES_DIFFER_ADDRESSES);
        require(addresses.length == claps.length, ADDRESSES_DIFFER_CLAPS);
        uint registrationFeeWei =
            registrationFeeUSDWei.mul(1 ether).div(ETHPriceUSDWei);
        uint totalFeesWei = registrationFeeWei.mul(addresses.length);
        require(address(this).balance >= totalFeesWei, INSUFFICIENT_VALUE);
        uint totalClaps = 0;
        for (uint i = 0; i < claps.length; i = i.add(1)) {
            totalClaps = totalClaps.add(claps[i]);
        }
        uint[] memory rewards = new uint[](claps.length);
        for (uint i = 0; i < claps.length; i = i.add(1)) {
            rewards[i] = claps[i].mul(totalFeesWei).div(totalClaps);
        }
        emit Assessment(
            now,
            registrationFeeUSDWei,
            ETHPriceUSDWei,
            names,
            addresses,
            claps,
            registrationFeeWei,
            totalFeesWei,
            totalClaps,
            rewards
        );
        uint rewardedAmount = 0;
        for (uint i = 0; i < addresses.length; i = i.add(1)) {
            if (rewards[i] > 0 && addresses[i].send(rewards[i])) {
                emit Transfer(
                    names[i],
                    addresses[i],
                    registrationFeeUSDWei,
                    registrationFeeWei,
                    claps[i],
                    rewards[i]
                );
                rewardedAmount += rewards[i];
            }
        }
        emit RewardedAmount(rewardedAmount);
    }
}
