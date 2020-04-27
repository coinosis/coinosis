import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AccountContext } from './coinosis';
import { Link, Loading } from './helpers';

const Assessment = () => {

  const [account] = useContext(AccountContext);
  const [users, setUsers] = useState();
  const [totalClaps, setTotalClaps] = useState();
  const [clapsLeft, setClapsLeft] = useState();
  const [assessment, setAssessment] = useState({});

  useEffect(() => {
    fetch('http://localhost:3000/users')
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
        console.log(error);
      });
  }, []);

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
    if (clapsLeft >= 0) {
      setAssessment(newAssessment);
    }
  }, [assessment]);

  if (users === undefined) return <Loading/>

  return (
    <div>
      <Claps
        clapsLeft={clapsLeft}
      />
      <Users
        users={users}
        assessment={assessment}
        attemptAssessment={attemptAssessment}
      />
    </div>
  );
}

const Claps = ({ clapsLeft }) => {

  return (
    <div
      css={`
        display: flex;
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

const Users = ({ users, assessment, attemptAssessment }) => {

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
      {users.map(user => {
        const { address, name } = user;
        const claps = assessment[address] || '';
         return (
           <User
             key={address}
             name={name}
             address={address}
             claps={claps}
             setClaps={value => setClaps(address, value)}
           />
         );
      })}
    </div>
  );
}

const User = ({ name, address, claps, setClaps }) => {

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
          type="number"
          value={claps}
          min={0}
          step={1}
          onChange={e => setClaps(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Assessment;
