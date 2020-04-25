import React, { useCallback, useState } from 'react';
import Account from './account';

const Registration = () => {

  const [account, setAccount] = useState();
  const [name, setName] = useState('');

  const register = useCallback(() => {
    console.log(account, name);
  }, [account, name]);

  return (
    <div>
      <Account
        account={account}
        setAccount={setAccount}
      />
      <div>
        <div>¿cómo te llamas?</div>
        <div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
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
    </div>
  );
}

export default Registration;
