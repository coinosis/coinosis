import React, { createContext, useEffect, useState } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Web3 from 'web3';
import { createGlobalStyle } from 'styled-components';
import InstallMetamask from './installMetamask';
import contractJson from '../build/contracts/Coinosis.json';
import { environment, Loading, NoContract } from './helpers';
import settings from './settings.json';
import Header from './header';
import EventList from './eventList';
import Event from './event';

export const Web3Context = createContext();
export const ContractContext = createContext();
export const AccountContext = createContext();
export const BackendContext = createContext();
export const CurrencyContext = createContext([]);

export const ETH = Symbol('ETH');
export const USD = Symbol('USD');

const Coinosis = () => {

  const [web3, setWeb3] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();
  const [name, setName] = useState();
  const [backendURL, setBackendURL] = useState();
  const [currencyType, setCurrencyType] = useState(ETH);

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
        setBackendURL(settings[environment].backend);
      }).catch(err => {
        setBackendURL(null);
      });
  }, []);

  if (web3 === null) return <InstallMetamask/>
  if (contract === undefined || backendURL === undefined) return <Loading/>
  if (contract === null) return <NoContract/>

  return (
    <Web3Context.Provider value={web3}>
      <ContractContext.Provider value={contract}>
        <AccountContext.Provider value={{ account, setAccount, name, setName }}>
          <BackendContext.Provider value={backendURL}>
            <CurrencyContext.Provider value={[currencyType, setCurrencyType]}>
              <GlobalStyle/>
              <HashRouter>
                <Header/>
                <Switch>
                  <Route path="/:eventURL">
                    <Event/>
                  </Route>
                  <Route path="/">
                    <EventList />
                  </Route>
                </Switch>
              </HashRouter>
            </CurrencyContext.Provider>
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
