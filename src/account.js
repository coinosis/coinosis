import React, { useCallback, useContext, useEffect } from 'react';
import { Web3Context, AccountContext, BackendContext } from './coinosis.js';
import { environment, Loading, Hash, EtherscanLink } from './helpers.js';

const Account = () => {

  const web3 = useContext(Web3Context);
  const backendURL = useContext(BackendContext);
  const [account, setAccount, name, setName] = useContext(AccountContext);

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
    fetch(`${backendURL}/user/${account}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        else {
          return response.json();
        }
      }).then(data => {
        setName(data.name);
      }).catch(err => {
        setName(null);
      });
  }, [account]);

  if (account === undefined) return <Loading />
  if (account === null) return <Login />

  if (!name) {
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
          cuenta
        </div>
        <Hash
          type="address"
          value={account}
          toolTipPosition="bottomRight"
        />
      </div>
    );
  }

  return (
    <EtherscanLink
      type="address"
      value={account}
      toolTipPosition="bottomRight"
    >
      {name}
    </EtherscanLink>
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
