pragma solidity 0.5.16;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Event {

    using SafeMath for uint256;

    bytes5 constant public version = "2.2.3";
    uint8 constant private CLAPS_PER_ATTENDEE = 100;
    uint8 constant private MAX_ATTENDEES = 50;

    uint8 constant private ATTENDEE_UNREGISTERED = 0;
    uint8 constant private ATTENDEE_REGISTERED = 1;
    uint8 constant private ATTENDEE_CLAPPED = 2;
    bool distributionMade;

    uint128 public fee;
    uint32 public end;
    address payable[] private attendees;
    mapping(address => uint8) public states;
    mapping(address => uint256) public claps;
    uint256 public totalClaps;

    event Distribution (uint256 totalReward);
    event Transfer (address indexed attendee, uint256 reward);

    constructor (uint128 _fee, uint32 _end) public {
        require(block.timestamp < _end);
        fee = _fee;
        end = _end;
    }

    function getAttendees () external view returns (address payable[] memory) {
        return attendees;
    }

    function register (address payable _attendee, uint256 _fee) internal {
        require(_fee == fee);
        require(states[_attendee] == ATTENDEE_UNREGISTERED);
        require(attendees.length < MAX_ATTENDEES);
        require(block.timestamp < end);
        states[_attendee] = ATTENDEE_REGISTERED;
        attendees.push(_attendee);
        claps[_attendee] = 1;
        totalClaps += 1;
    }

    function register () external payable {
        register(msg.sender, msg.value);
    }

    function clap (
        address _clapper,
        address[] memory _attendees,
        uint256[] memory _claps
    ) internal {
        require(distributionMade == false);
        require(states[_clapper] == ATTENDEE_REGISTERED);
        require(_attendees.length == _claps.length);
        states[_clapper] = ATTENDEE_CLAPPED;
        uint256 givenClaps;
        for (uint256 i; i < _attendees.length; i = i.add(1)) {
            givenClaps = givenClaps.add(_claps[i]);
            if (_attendees[i] == _clapper) continue;
            if (states[_attendees[i]] == ATTENDEE_UNREGISTERED) continue;
            claps[_attendees[i]] = claps[_attendees[i]].add(_claps[i]);
        }
        require(givenClaps <= CLAPS_PER_ATTENDEE);
        totalClaps = totalClaps.add(givenClaps);
    }

    function clap (address[] calldata _attendees, uint256[] calldata _claps)
        external {
        clap(msg.sender, _attendees, _claps);
    }

    function distribute () external {
        require(distributionMade == false);
        require(block.timestamp >= end);
        require(totalClaps > 0);
        distributionMade = true;
        uint256 totalReward = address(this).balance;
        emit Distribution(totalReward);
        for (uint256 i; i < attendees.length; i = i.add(1)) {
            uint256 reward = claps[attendees[i]]
                .mul(totalReward)
                .div(totalClaps);
            (bool success, ) = attendees[i].call.value(reward)("");
            if (success) {
                emit Transfer(attendees[i], reward);
            }
        }
    }
}
