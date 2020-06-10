pragma solidity 0.5.16;

import "./Event.sol";

contract ProxyEvent is Event {

    bytes5 constant public version = "2.0.0";
    mapping(address => address) public proxy;

    constructor(uint64 _fee, uint32 _end) Event(_fee, _end) public {}

    function registerFor (address payable _attendee) external payable {
        register(_attendee, msg.value);
        proxy[_attendee] = msg.sender;
    }

    function clapFor (
        address _clapper,
        address[] calldata _attendees,
        uint256[] calldata _claps
    ) external {
        require(proxy[_clapper] == msg.sender);
        clap(_clapper, _attendees, _claps);
    }
}
