import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { REGISTRATION, AccountContext } from './coinosis';
import { environment, Link, Loading, post } from './helpers';
import settings from './settings.json';
import Account from './account';

const Assessment = ({ setSelectedTab }) => {

  const [account, setAccount, name, setName] = useContext(AccountContext);
  const [users, setUsers] = useState();
  const [totalClaps, setTotalClaps] = useState();
  const [clapsLeft, setClapsLeft] = useState();
  const [assessment, setAssessment] = useState({});
  const [clapsError, setClapsError] = useState(false);
  const [sent, setSent] = useState();

  useEffect(() => {
    fetch(`${settings[environment].backend}/users`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          return response.json();
        }
      }).then(data => {
        const users = data.filter(user => user.address !== account);
        setUsers(users);
      }).catch(error => {
        console.error(error);
      });
  }, [account]);

  useEffect(() => {
    if (!name) return;
    fetch(`${settings[environment].backend}/assessment/${account}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          return response.json();
        }
      }).then(data => {
        setAssessment(data.assessment);
        setSent(true);
      }).catch(error => {
        if (!error.toString().includes('404')) {
          console.error(error);
        }
      });
  }, [name, account]);

  useEffect(() => {
    if (users) {
      const totalClaps = users.length * 3;
      setTotalClaps(totalClaps);
      const assessment = {};
      for (const key in users) {
        assessment[users[key].address] = 0;
      }
      setAssessment(assessment);
    }
  }, [users]);

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
    const object = { sender: account, assessment };
    post('assessments', object, (error, data) => {
      if(error) {
        console.error(error);
        return;
      }
      setAssessment(data.assessment);
      setSent(true);
    });
  }, [account, assessment]);

  if (account === null) return <Account />

  if (name === null) {
    return (
      <div>
        <span
          onClick={() => setSelectedTab(REGISTRATION)}
          css={`
            margin-right: 5px;
            text-decoration: underline;
            cursor: pointer;
          `}
        >
          regístrate
        </span>
        para poder aplaudir.
      </div>
    );
  }

  if (users === undefined || sent === undefined) return <Loading/>

  return (
    <div>
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
      <div>
        <button
          onClick={send}
          disabled={sent}
        >
          {sent ? 'enviado' : 'enviar'}
        </button>
      </div>
    </div>
  );
}

const Claps = ({ clapsLeft, clapsError, sent }) => {

  if (sent) return <div>gracias por tu tiempo!</div>

  return (
    <div
      css={`
        display: flex;
        color: ${clapsError ? '#a04040' : 'black'};
      `}
    >
      <div
        css={`
          margin-right: 5px;
        `}
      >
        aplausos restantes:
      </div>
      <div>
        {clapsLeft}
      </div>
    </div>
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
    <div>
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
    </div>
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
    <div
      css={`
        display: flex;
      `}
    >
      <div>
        <Link
          type="address"
          value={address}
        >
          {name}
        </Link>
      </div>
      <div>
        <input
          ref={clapInput}
          type="number"
          value={claps}
          min={0}
          step={1}
          onChange={e => setClaps(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default Assessment;
