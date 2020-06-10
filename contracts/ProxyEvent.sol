pragma solidity 0.5.16;

import "./Event.sol";

contract ProxyEvent is Event {

    bytes5 constant public version = "2.0.0";
    mapping(address => address) public proxy;

    constructor(uint64 _fee, uint32 _end) Event(_fee, _end) public {}

    function registerFor (address payable _attendee) public payable {
        register(_attendee, msg.value);
        proxy[_attendee] = msg.sender;
    }

    function clapFor (
        address _clapper,
        address[] memory _attendees,
        uint256[] memory _claps
    ) public {
        require(proxy[_clapper] == msg.sender);
        clap(_clapper, _attendees, _claps);
    }
}
