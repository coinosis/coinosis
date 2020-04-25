import React, { createContext, useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import styled, { createGlobalStyle } from 'styled-components';
import InstallMetamask from './installMetamask';
import Registration from './registration';
import Result from './result';

const REGISTRATION = Symbol('REGISTRATION');
const ASSESSMENT = Symbol('ASSESSMENT');
const RESULT = Symbol('RESULT');

export const Web3Context = createContext();

const Coinosis = () => {

  const [web3, setWeb3] = useState();
  const [selectedTab, setSelectedTab] = useState(REGISTRATION);
  const [ActiveElement, setActiveElement] = useState(() => Result);

  useEffect(() => {
    if (!Web3.givenProvider) {
      setWeb3(null);
      return;
    }
    const web3 = new Web3(Web3.givenProvider);
    setWeb3(web3);
  }, []);

  useEffect(() => {
    if (selectedTab === REGISTRATION) {
      setActiveElement(() => Registration);
    }
    else if (selectedTab === ASSESSMENT) {
      setActiveElement(() => Assessment);
    }
    else if (selectedTab === RESULT) {
      setActiveElement(() => Result);
    }
  }, [selectedTab]);

  if (web3 === null) return <InstallMetamask/>

  return (
    <Web3Context.Provider value={web3}>
      <GlobalStyle/>
      <Header/>
      <Tabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <ActiveElement/>
    </Web3Context.Provider>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: #f0f0f0;
  }
`

const Header = () => {
  return (
    <div
      css={`
        font-size: 34px;
        text-align: center;
      `}
    >
      coinosis
    </div>
  );
}

const Tabs = ({ selectedTab, setSelectedTab }) => {

  return (
    <div
      css={`
        display: flex;
        justify-content: center;
        margin-bottom: 50px;
      `}
    >
      <Tab
        id={REGISTRATION}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <Tab
        id={ASSESSMENT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <Tab
        id={RESULT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
    </div>
  );
}

const Tab = ({ id, selectedTab, setSelectedTab }) => {

  const [name, setName] = useState('');
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const name = id === REGISTRATION ?
          'registro' :
          id === ASSESSMENT ?
          'aplausos' :
          id === RESULT ?
          'resultados' :
          '';
    setName(name);
    setIsSelected(id === selectedTab);
  }, [selectedTab]);

  const select = useCallback(() => {
    setSelectedTab(id);
  }, []);

  return (
    <StyledTab
      isSelected={isSelected}
      onClick={select}
    >
      {name}
    </StyledTab>
  );

}

const StyledTab = styled.div`
  padding: 10px;
  background: ${({ isSelected }) => isSelected ? '#e0e0e0' : '#f8f8f8'};
  border: 1px solid #e0e0e0;
  cursor: pointer;
  user-select: none;
`

const Assessment = () => {
  return <div>assessment</div>
}

export default Coinosis
