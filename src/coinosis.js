import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import Web3 from 'web3';
import styled, { createGlobalStyle } from 'styled-components';
import contractJson from '../build/contracts/Coinosis.json';

const Web3Context = createContext();
const ContractContext = createContext();
const CurrencyContext = createContext([]);

const usdPlaceholder = ' '.repeat(4);
const ethPlaceholder = ' '.repeat(5);
const datePlaceholder = ' '.repeat(21);
const percentagePlaceholder = ' '.repeat(4);
const ETH = 'eth';
const USD = 'usd';

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
