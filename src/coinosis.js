import React, { createContext, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import styled, { createGlobalStyle } from 'styled-components';
import logo from './assets/logo.png';
import InstallMetamask from './installMetamask';
import contractJson from '../build/contracts/Coinosis.json';
import { environment, Hash, Loading, NoContract } from './helpers';
import settings from './settings.json';
import Account from './account';
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

const Header = () => {

  return (
    <div
      css={`
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafafa;
        box-shadow: 0 1px 10px rgba(151, 164, 175, .1);
        padding: 10px 40px;
        margin-bottom: 40px;
      `}
    >
      <HeaderItem
        css={`
          justify-content: flex-start;
        `}
      >
        <ContractInfo/>
      </HeaderItem>
      <HeaderItem
        css={`
          justify-content: center;
          font-size: 26px;
        `}
      >
        <img src={logo} height={45} alt="coinosis" />
      </HeaderItem>
      <HeaderItem
        css={`
          justify-content: flex-end;
        `}
      >
        <Account/>
      </HeaderItem>
    </div>
  );
}

const HeaderItem = styled.div`
  width: 33.333%;
  display: flex;
`

const ContractInfo = () => {

  const contract = useContext(ContractContext);
  const [address, setAddress] = useState('');
  const [version, setVersion] = useState('');

  useEffect(() => {
    if (contract) {
      setAddress(contract._address);
      contract.methods.version().call().then(setVersion);
    }
  }, [contract]);

  return (
    <div
      css={`
        display: flex;
        justify-content: center;
      `}
    >
      <div>
        contrato
      </div>
      <div
        css={`
          margin: 0 5px;
        `}
      >
        <Hash type="address" value={address} toolTipPosition="bottomLeft" />
      </div>
      <div>
        {version}
      </div>
    </div>
  );
}

export default Coinosis
