pragma solidity 0.5.16;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract Event {

    using SafeMath for uint16;

    string constant private version = "2.0.0";
    string constant private WRONG_FEE = "wrong-fee";
    string constant private ALREADY_REGISTERED = "already-registered";
    string constant private UNAUTHORIZED = "unauthorized";
    string constant private WRONG_CLAPS = "wrong-claps";

    string public id;
    uint64 public fee;
    address payable[] public attendees;
    mapping(address => uint8) public states;
    mapping(address => uint16) public claps;

    constructor (string memory _id, uint64 _fee) public {
        id = _id;
        fee = _fee;
    }

    function register() external payable {
        require(msg.value == fee, WRONG_FEE);
        require(states[msg.sender] == 0, ALREADY_REGISTERED);
        states[msg.sender] = 1;
        attendees.push(msg.sender);
    }

    function clap(address[] calldata _attendees, uint16[] calldata _claps)
        external {
        require(states[msg.sender] == 1, UNAUTHORIZED);
        require(_attendees.length == _claps.length, WRONG_CLAPS);
        states[msg.sender] = 2;
        for (uint16 i = 0; i < _attendees.length; i = uint16(i.add(1))) {
            if (_attendees[i] == msg.sender) continue;
            claps[_attendees[i]] = uint16(claps[_attendees[i]].add(_claps[i])); // does this uint16 conversion defeat the purpose of SafeMath?
        }
    }
}
