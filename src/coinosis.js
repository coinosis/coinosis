import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import { createGlobalStyle } from 'styled-components';
import Contract from './contract';

export const Web3Context = createContext();

const Coinosis = () => {

  const [web3, setWeb3] = useState();

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider);
    setWeb3(web3);
  }, []);

  return (
    <Web3Context.Provider value={web3}>
      <GlobalStyle/>
      <Contract/>
    </Web3Context.Provider>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: #f0f0f0;
  }
`

export default Coinosis
