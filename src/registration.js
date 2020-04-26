import React, { useCallback, useContext, useState } from 'react';
import { AccountContext } from './coinosis';
import { Link } from './helpers';
import Account from './account';

const Registration = ({ name, setName }) => {

  const [account, setAccount] = useContext(AccountContext);
  const [unsavedName, setUnsavedName] = useState('');

  const register = useCallback(() => {
    fetch('http://localhost:3000/users', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({address: account, name: unsavedName}),
    }).then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      } else {
        return response.json();
      }
    }).then(data => {
      setName(data.name);
    }).catch(err => {
        setName('');
      });
  }, [account, unsavedName]);

  if (!account) {
    return (
      <Account
        account={account}
        setAccount={setAccount}
        name={name}
        setName={setName}
      />
    );
  }

  if (!name) {
    return (
      <div
        css={`
          display: flex;
        `}
      >
        <div>¿cómo te llamas?</div>
        <div
          css={`
            margin: 0 5px;
          `}
        >
          <input
            value={unsavedName}
            onChange={e => setUnsavedName(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={register}
          >
            regístrate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      css={`
        display: flex;
      `}
    >
      <div>
        gracias por registrarte,
      </div>
      <div
        css={`
          margin: 0 5px;
        `}
      >
        <Link type="address" value={account}>
          {name}
        </Link>
      </div>
      <div>
        !
      </div>
    </div>
  );
}

export default Registration;
