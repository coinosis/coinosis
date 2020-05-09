import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AccountContext, BackendContext } from './coinosis';
import { ATTENDANCE } from './event';
import { environment, EtherscanLink, Link, Loading, usePost } from './helpers';
import Account from './account';

const Assessment = ({
  sent,
  setSent,
  url: event,
  attendees
}) => {

  const { account, name } = useContext(AccountContext);
  const backendURL = useContext(BackendContext);
  const [users, setUsers] = useState();
  const [totalClaps, setTotalClaps] = useState();
  const [clapsLeft, setClapsLeft] = useState();
  const [assessment, setAssessment] = useState({});
  const [clapsError, setClapsError] = useState(false);
  const post = usePost();

  useEffect(() => {
    fetch(`${backendURL}/event/${event}/attendees`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          return response.json();
        }
      }).then(data => {
        const attendees = data
              .filter(attendee => attendee.address !== account)
              .sort((a, b) => a.name.localeCompare(b.name));
        setUsers(attendees);
        setAssessment({});
      }).catch(error => {
        console.error(error);
      });
  }, [account]);

  useEffect(() => {
    if (!name) return;
    fetch(`${backendURL}/assessment/${event}/${account}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        } else {
          return response.json();
        }
      }).then(data => {
        setAssessment(data.assessment);
        setSent(true);
      }).catch(error => {
        if (error.toString().includes('404')) {
          setSent(false);
        } else {
          console.error(error);
        }
      });
  }, [name, account]);

  useEffect(() => {
    if (users && users.length) {
      const totalClaps = users.length * 3;
      setTotalClaps(totalClaps);
      if (!Object.keys(assessment).length) {
        const assessment = {};
        for (const key in users) {
          assessment[users[key].address] = 0;
        }
        setAssessment(assessment);
      }
    }
  }, [assessment, users]);

  const computeClapsLeft = useCallback(assessment => {
    let clapsGiven = 0;
    for (const address in assessment) {
      clapsGiven += assessment[address];
    }
    return totalClaps - clapsGiven;
  }, [totalClaps]);

  useEffect(() => {
    if (assessment && totalClaps) {
      const clapsLeft = computeClapsLeft(assessment)
      setClapsLeft(clapsLeft);
    }
  }, [assessment, totalClaps]);

  const attemptAssessment = useCallback(assessmentFn => {
    const newAssessment = assessmentFn(assessment);
    const clapsLeft = computeClapsLeft(newAssessment);
    if (clapsLeft < 0) {
      setClapsError(true);
      return;
    }
    setClapsError(false);
    setAssessment(newAssessment);
  }, [assessment]);

  const send = useCallback(() => {
    const object = { event, sender: account, assessment };
    post('assessments', object, (error, data) => {
      if(error) {
        console.error(error);
        return;
      }
      setAssessment(data.assessment);
      setSent(true);
    });
  }, [account, assessment]);

  if (account === null || name === null) {
    return (
      <div
        css={`
          display: flex;
          justify-content: center;
        `}
      >
        <Account />
      </div>
    );
  }

  if (users === undefined || sent === undefined) return <Loading/>

  if (!attendees.includes(account)) {
    return (
      <div
        css={`
          display: flex;
          justify-content: center;
        `}
      >
        <Link to={`${event}/${ATTENDANCE}`}>
          inscríbete
        </Link>
        para poder aplaudir.
      </div>
    );
  }

  if (!users.length) {
    return (
      <div
        css={`
          display: flex;
          justify-content: center;
        `}
      >
        nadie se ha inscrito todavía.
      </div>
    );
  }

  return (
    <div
      css={`
        display: flex;
        justify-content: center;
      `}
    >
    <table>
      <Claps
        clapsLeft={clapsLeft}
        clapsError={clapsError}
        sent={sent}
      />
      <Users
        users={users}
        assessment={assessment}
        attemptAssessment={attemptAssessment}
        clapsError={clapsError}
        disabled={sent}
      />
      <tfoot>
        <tr>
          <td/>
          <td>
            <button
              onClick={send}
              disabled={sent}
            >
              {sent ? 'enviado' : 'enviar'}
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
    </div>
  );
}

const Claps = ({ clapsLeft, clapsError, sent }) => {

  if (sent) {
    return (
      <thead>
        <tr>
          <td
            colSpan={2}
            css={`
              text-align: center;
              font-weight: 700;
            `}
          >
            gracias por tu tiempo!
          </td>
        </tr>
      </thead>
    );
  }

  return (
    <thead>
      <tr
        css={`
          color: ${clapsError ? '#a04040' : 'black'};
        `}
      >
        <td
          css={`
            text-align: right;
          `}
        >
          aplausos restantes:
        </td>
        <td
          css={`
            font-weight: ${clapsError ? 700 : 300};
          `}
        >
          {clapsLeft}
        </td>
      </tr>
    </thead>
  );
}

const Users = ({ users, assessment, attemptAssessment, disabled }) => {

  const setClaps = useCallback((address, value) => {
    const claps = Math.abs(Math.floor(Number(value)))
    attemptAssessment(assessment => {
      const newAssessment = {...assessment}
      newAssessment[address] = +claps;
      return newAssessment;
    });
  }, [assessment]);

  return (
    <tbody>
      {users.map((user, i) => {
        const { address, name } = user;
        const claps = assessment[address] || '';
        const hasFocus = i === 0;
         return (
           <User
             key={address}
             hasFocus={hasFocus}
             name={name}
             address={address}
             claps={claps}
             setClaps={value => setClaps(address, value)}
             disabled={disabled}
           />
         );
      })}
    </tbody>
  );
}

const User = ({ name, address, claps, setClaps, hasFocus, disabled }) => {

  const clapInput = createRef();

  useEffect(() => {
    if (hasFocus) {
      clapInput.current.focus();
    }
  }, [hasFocus]);

  return (
    <tr
      css={`
      `}
    >
      <td
        css={`
          text-align: right;
        `}
      >
        <EtherscanLink
          type="address"
          value={address}
        >
          {name}
        </EtherscanLink>
      </td>
      <td
        css={`

        `}
      >
        <input
          ref={clapInput}
          type="number"
          value={claps}
          min={0}
          step={1}
          onChange={e => setClaps(e.target.value)}
          disabled={disabled}
          css={`
            width: 60px;
          `}
        />
      </td>
    </tr>
  );
}

export default Assessment;
