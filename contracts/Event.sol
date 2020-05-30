pragma solidity 0.5.16;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Event {

    using SafeMath for uint256;

    string constant private version = "2.0.0";
    string constant private WRONG_FEE = "wrong-fee";
    string constant private ALREADY_REGISTERED = "already-registered";
    string constant private UNAUTHORIZED = "unauthorized";
    string constant private WRONG_CLAPS = "wrong-claps";

    string public id;
    uint64 public fee;
    address payable[] public attendees;
    mapping(address => uint8) public states;
    mapping(address => uint256) public claps;

    constructor (string memory _id, uint64 _fee) public {
        id = _id;
        fee = _fee;
    }

    function register() public payable {
        require(msg.value == fee, WRONG_FEE);
        require(states[msg.sender] == 0, ALREADY_REGISTERED);
        states[msg.sender] = 1;
        attendees.push(msg.sender);
    }

    function clap(address[] memory _attendees, uint256[] memory _claps)
        public {
        require(states[msg.sender] == 1, UNAUTHORIZED);
        require(_attendees.length == _claps.length, WRONG_CLAPS);
        states[msg.sender] = 2;
        for (uint256 i = 0; i < _attendees.length; i = i.add(1)) {
            if (_attendees[i] == msg.sender) continue;
            claps[_attendees[i]] = claps[_attendees[i]].add(_claps[i]);
        }
    }
}
