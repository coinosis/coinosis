pragma solidity 0.5.16;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Event {

    using SafeMath for uint256;

    bytes5 constant public version = "2.0.0";
    uint8 constant private CLAPS_PER_ATTENDEE = 3;
    uint8 constant private MAX_ATTENDEES = 100;

    uint8 constant private ATTENDEE_UNREGISTERED = 0;
    uint8 constant private ATTENDEE_REGISTERED = 1;
    uint8 constant private ATTENDEE_CLAPPED = 2;
    uint8 constant private ATTENDEE_REWARDED = 3;

    string constant private WRONG_FEE = "wrong-fee";
    string constant private ALREADY_REGISTERED = "already-registered";
    string constant private UNAUTHORIZED = "unauthorized";
    string constant private DIFFERENT_LENGTHS = "different-lengths";
    string constant private TOO_MANY_ATTENDEES = "too-many-attendees";
    string constant private TOO_MANY_CLAPS = "too-many-claps";
    string constant private NO_CLAPS = "no-claps";
    string constant private EVENT_FINISHED = "event-finished";
    string constant private EVENT_NOT_FINISHED = "event-not-finished";

    uint64 public fee;
    uint32 public end;
    address payable[] public attendees;
    mapping(address => uint8) public states;
    mapping(address => uint256) public claps;
    uint256 public totalClaps;

    event Distribution (uint256 totalReward);
    event Transfer (address indexed attendee, uint256 reward);

    constructor (uint64 _fee, uint32 _end) public {
        require(block.timestamp < _end, EVENT_FINISHED);
        fee = _fee;
        end = _end;
    }

    function getAttendees () external view returns (address payable[] memory) {
        return attendees;
    }

    function register () public payable {
        require(msg.value == fee, WRONG_FEE);
        require(
            states[msg.sender] == ATTENDEE_UNREGISTERED,
            ALREADY_REGISTERED
        );
        require(attendees.length < MAX_ATTENDEES, TOO_MANY_ATTENDEES);
        require(block.timestamp < end, EVENT_FINISHED);
        states[msg.sender] = ATTENDEE_REGISTERED;
        attendees.push(msg.sender);
    }

    function clap (address[] memory _attendees, uint256[] memory _claps)
        public {
        require(states[msg.sender] == ATTENDEE_REGISTERED, UNAUTHORIZED);
        require(_attendees.length == _claps.length, DIFFERENT_LENGTHS);
        states[msg.sender] = ATTENDEE_CLAPPED;
        uint256 givenClaps;
        for (uint256 i = 0; i < _attendees.length; i = i.add(1)) {
            givenClaps = givenClaps.add(_claps[i]);
            if (_attendees[i] == msg.sender) continue;
            if (states[_attendees[i]] == ATTENDEE_UNREGISTERED) continue;
            claps[_attendees[i]] = claps[_attendees[i]].add(_claps[i]);
        }
        require(
            givenClaps <= attendees.length * CLAPS_PER_ATTENDEE,
            TOO_MANY_CLAPS
        );
        totalClaps = totalClaps.add(givenClaps);
    }

    function distribute () external {
        require(block.timestamp >= end, EVENT_NOT_FINISHED);
        require(totalClaps > 0, NO_CLAPS);
        uint256 totalReward = address(this).balance;
        emit Distribution(totalReward);
        for (uint256 i = 0; i < attendees.length; i = i.add(1)) {
            if (states[attendees[i]] == ATTENDEE_REWARDED) continue;
            if (claps[attendees[i]] == 0) continue;
            uint256 reward = claps[attendees[i]]
                .mul(totalReward)
                .div(totalClaps);
            states[attendees[i]] = ATTENDEE_REWARDED;
            (bool success, ) = attendees[i].call.value(reward)("");
            if (success) {
                emit Transfer(attendees[i], reward);
            }
        }
    }
}
