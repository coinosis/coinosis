
// File: @openzeppelin/contracts/math/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     *
     * _Available since v2.4.0._
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// File: contracts/Event.sol

pragma solidity 0.5.16;


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
