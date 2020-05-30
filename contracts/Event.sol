pragma solidity 0.5.16;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Event {

    using SafeMath for uint256;

    string constant private version = "2.0.0";
    uint8 constant private ATTENDEE_UNREGISTERED = 0;
    uint8 constant private ATTENDEE_REGISTERED = 1;
    uint8 constant private ATTENDEE_CLAPPED = 2;
    uint256 constant public CLAPS_PER_ATTENDEE = 3;
    string constant private WRONG_FEE = "wrong-fee";
    string constant private ALREADY_REGISTERED = "already-registered";
    string constant private UNAUTHORIZED = "unauthorized";
    string constant private DIFFERENT_LENGTHS = "different-lengths";
    string constant private TOO_MANY_ATTENDEES = "too-many-attendees";
    string constant private TOO_MANY_CLAPS = "too-many-claps";

    string public id;
    uint64 public fee;
    address payable[] public attendees;
    mapping(address => uint8) public states;
    mapping(address => uint256) public claps;
    uint256 public allowedClaps;

    constructor (string memory _id, uint64 _fee) public {
        id = _id;
        fee = _fee;
        allowedClaps = 0;
    }

    function register() public payable {
        require(msg.value == fee, WRONG_FEE);
        require(
            states[msg.sender] == ATTENDEE_UNREGISTERED,
            ALREADY_REGISTERED
        );
        require(attendees.length < 100, TOO_MANY_ATTENDEES);
        states[msg.sender] = ATTENDEE_REGISTERED;
        attendees.push(msg.sender);
        allowedClaps = allowedClaps.add(CLAPS_PER_ATTENDEE);
    }

    function clap(address[] memory _attendees, uint256[] memory _claps)
        public {
        require(states[msg.sender] == ATTENDEE_REGISTERED, UNAUTHORIZED);
        require(_attendees.length == _claps.length, DIFFERENT_LENGTHS);
        states[msg.sender] = ATTENDEE_CLAPPED;
        uint256 totalClaps = 0;
        for (uint256 i = 0; i < _attendees.length; i = i.add(1)) {
            totalClaps = totalClaps.add(_claps[i]);
            if (_attendees[i] == msg.sender) continue;
            if (states[_attendees[i]] == ATTENDEE_UNREGISTERED) continue;
            claps[_attendees[i]] = claps[_attendees[i]].add(_claps[i]);
        }
        require(totalClaps <= allowedClaps, TOO_MANY_CLAPS);
    }
}
