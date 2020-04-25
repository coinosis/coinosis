import React, { useCallback, useContext, useEffect } from 'react';
import { Web3Context } from './coinosis.js';
import { Loading } from './helpers.js';

const Account = ({ account, setAccount }) => {

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

  if (account === undefined) return <Loading />
  if (account === null) return <Login />

  return <div>{account}</div>

}

const Login = () => {

  const web3 = useContext(Web3Context);
  const login = useCallback(() => {
    web3.eth.requestAccounts();
  }, [web3]);

  return (
    <div
      onClick={login}
    >
      inicia sesión con Metamask
    </div>
  );

}

export default Account
