pragma solidity 0.5.16;

contract Coinosis {

    address payable constant coinosis =
        0xe1fF19182deb2058016Ae0627c1E4660A895196a;
    string constant ZERO_VALUE = "The ether value sent is zero (zero-value)";
    string constant EMPTY_NAME = "The name provided is empty (empty-name)";
    string constant DIFFERENT_LENGTHS =
        "The number of recipients differs from the number of amounts \
(different-lengths)";
    string constant INSUFFICIENT_VALUE =
        "The ether value sent is less than the total intended amount to send \
(insufficient-value).";

    event Received(address sender, string name, uint amount);
    event Paid(address recipient, uint amount);

    function receive(string memory name) public payable {
        require(msg.value > 0, ZERO_VALUE);
        require(bytes(name).length > 0, EMPTY_NAME);
        coinosis.transfer(msg.value);
        emit Received(msg.sender, name, msg.value);
    }

    function assess(
        address payable[] memory recipients,
        uint[] memory claps,
        uint registrationPriceUSDWei,
        uint ETHPriceUSDWei
    ) public payable {
        uint totalPriceUSDWei = registrationPriceUSDWei * recipients.length;
        uint totalPriceWei = totalPriceUSDWei * 1 ether / ETHPriceUSDWei;
        uint totalClaps = 0;
        for (uint i = 0; i < claps.length; i++) {
            totalClaps += claps[i];
        }
        uint[] memory amounts = new uint[](claps.length);
        for (uint i = 0; i < claps.length; i++) {
            amounts[i] = claps[i] * totalPriceWei / totalClaps;
        }
        distribute(recipients, amounts);
    }
    
    function distribute(
        address payable[] memory recipients,
        uint[] memory amounts
    ) public payable {
        require(recipients.length == amounts.length, DIFFERENT_LENGTHS);
        uint totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(msg.value >= totalAmount, INSUFFICIENT_VALUE);
        for (uint i = 0; i < recipients.length; i++) {
            recipients[i].transfer(amounts[i]);
            emit Paid(recipients[i], amounts[i]);
        }
    }
}
