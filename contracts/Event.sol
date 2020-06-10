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

    uint64 public fee;
    uint32 public end;
    address payable[] public attendees;
    mapping(address => uint8) public states;
    mapping(address => uint256) public claps;
    uint256 public totalClaps;

    event Distribution (uint256 totalReward);
    event Transfer (address indexed attendee, uint256 reward);

    constructor (uint64 _fee, uint32 _end) public {
        require(block.timestamp < _end);
        fee = _fee;
        end = _end;
    }

    function getAttendees () external view returns (address payable[] memory) {
        return attendees;
    }

    function register () public payable {
        require(msg.value == fee);
        require(states[msg.sender] == ATTENDEE_UNREGISTERED);
        require(attendees.length < MAX_ATTENDEES);
        require(block.timestamp < end);
        states[msg.sender] = ATTENDEE_REGISTERED;
        attendees.push(msg.sender);
    }

    function clap (address[] memory _attendees, uint256[] memory _claps)
        public {
        require(states[msg.sender] == ATTENDEE_REGISTERED);
        require(_attendees.length == _claps.length);
        states[msg.sender] = ATTENDEE_CLAPPED;
        uint256 givenClaps;
        for (uint256 i; i < _attendees.length; i = i.add(1)) {
            givenClaps = givenClaps.add(_claps[i]);
            if (_attendees[i] == msg.sender) continue;
            if (states[_attendees[i]] == ATTENDEE_UNREGISTERED) continue;
            claps[_attendees[i]] = claps[_attendees[i]].add(_claps[i]);
        }
        require(givenClaps <= attendees.length.mul(CLAPS_PER_ATTENDEE));
        totalClaps = totalClaps.add(givenClaps);
    }

    function distribute () external {
        require(block.timestamp >= end);
        require(totalClaps > 0);
        uint256 totalReward = address(this).balance;
        emit Distribution(totalReward);
        for (uint256 i; i < attendees.length; i = i.add(1)) {
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
