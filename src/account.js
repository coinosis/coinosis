import React, { useCallback, useContext, useEffect } from 'react';
import { Web3Context } from './coinosis.js';
import { Loading, Hash, Link } from './helpers.js';

const Account = ({ account, setAccount, name, setName }) => {

  const web3 = useContext(Web3Context);

  const updateAccounts = useCallback(() => {
    web3.eth.getAccounts().then(accounts => {
      if (!accounts.length) {
        setAccount(null);
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
      }
    });    
  }, [web3, account]);

  useEffect(() => {
    if (!web3) return;
    const accountsInterval = setInterval(updateAccounts, 1000);
    return () => {
      clearInterval(accountsInterval);
    }
  }, [web3]);

  useEffect(() => {
    if(!account) return;
    fetch(`http://localhost:3000/user/${account}`)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        else {
          return response.json();
        }
      }).then(data => {
        setName(data.name);
      }).catch(err => {
        setName('');
      });
  }, [account]);

  if (account === undefined) return <Loading />
  if (account === null) return <Login />

  if (!name) {
    return (
      <Hash
        type="address"
        value={account}
        toolTipPosition="bottom"
      />
    );
  }

  return (
    <Link
      type="address"
      value={account}
      toolTipPosition="bottom"
    >
      {name}
    </Link>
  );

}

const Login = () => {

  const web3 = useContext(Web3Context);
  const login = useCallback(() => {
    web3.eth.requestAccounts();
  }, [web3]);

  return (
    <button
      onClick={login}
    >
      inicia sesión con Metamask
    </button>
  );

}

export default Account
