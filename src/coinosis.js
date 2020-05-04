import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import { createGlobalStyle } from 'styled-components';
import InstallMetamask from './installMetamask';
import contractJson from '../build/contracts/Coinosis.json';
import { environment, Loading, NoContract } from './helpers';
import settings from './settings.json';

import Header from './header';
import Event from './event';

export const Web3Context = createContext();
export const AccountContext = createContext();
export const ContractContext = createContext();
export const BackendContext = createContext();

const Coinosis = () => {

  const [web3, setWeb3] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();
  const [name, setName] = useState();
  const [backendOnline, setBackendOnline] = useState();

  useEffect(() => {
    if (!Web3.givenProvider) {
      setWeb3(null);
      return;
    }
    const web3 = new Web3(Web3.givenProvider);
    setWeb3(web3);
  }, []);

  useEffect(() => {
    if (!web3) return;
    web3.eth.net.getId().then(networkId => {
      const deployment = contractJson.networks[networkId];
      if (!deployment) {
        setContract(null);
        return;
      }
      const contractAddress = deployment.address;
      const contract = new web3.eth.Contract(contractJson.abi, contractAddress);
      setContract(contract);
    });
  }, [web3]);

  useEffect(() => {
    fetch(settings[environment].backend)
      .then(response => {
        setBackendOnline(true);
      }).catch(err => {
        setBackendOnline(false);
      });
  }, []);

  if (web3 === null) return <InstallMetamask/>
  if (contract === undefined) return <Loading/>
  if (contract === null) return <NoContract/>

  return (
    <Web3Context.Provider value={web3}>
      <ContractContext.Provider value={contract}>
        <AccountContext.Provider
          value={[account, setAccount, name, setName]}
        >
          <BackendContext.Provider value={backendOnline}>
            <GlobalStyle/>
            <Header/>
            <Event/>
          </BackendContext.Provider>
        </AccountContext.Provider>
      </ContractContext.Provider>
    </Web3Context.Provider>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: #f0f0f0;
    font-family: arial;
    margin: 0;
  }
`

export default Coinosis
