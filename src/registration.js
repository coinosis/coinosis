import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AccountContext } from './coinosis';
import { environment, Link, Loading } from './helpers';
import Account from './account';
import settings from './settings.json';

const Registration = ({ name, setName }) => {

  const [account, setAccount] = useContext(AccountContext);
  const [unsavedName, setUnsavedName] = useState('');
  const [message, setMessage] = useState('');

  const register = useCallback(() => {
    fetch(`${settings[environment].backend}/users`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({address: account, name: unsavedName}),
    }).then(response => {
      if (!response.ok) {
        throw Error(response.status);
      } else {
        return response.json();
      }
    }).then(data => {
      setName(data.name);
    }).catch(statusCode => {
      if(statusCode.toString().includes('400')) {
        setMessage('ese nombre ya existe en nuestra base de datos');
      }
    });
  }, [account, unsavedName]);

  useEffect(() => {
    if (message) setMessage('');
  }, [unsavedName]);

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

  if (name === undefined) return <Loading/>

  if (name === null) {
    return (
      <div
        css={`
          display: flex;
        `}
      >
        <div>nombre y apellido:</div>
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
            disabled={unsavedName === ''}
          >
            regístrate
          </button>
        </div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          {message}
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
