import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import Web3 from 'web3';
import styled, { createGlobalStyle } from 'styled-components';
import InstallMetamask from './installMetamask';
import { environment } from './helpers';
import settings from './settings.json';
import Account from './account';
import Registration from './registration';
import Assessment from './assessment';
import Result from './result';

const REGISTRATION = Symbol('REGISTRATION');
const ASSESSMENT = Symbol('ASSESSMENT');
const RESULT = Symbol('RESULT');

export const Web3Context = createContext();
export const AccountContext = createContext();
export const BackendContext = createContext();

const Coinosis = () => {

  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [name, setName] = useState();
  const [selectedTab, setSelectedTab] = useState(REGISTRATION);
  const [ActiveElement, setActiveElement] = useState(() => Registration);
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
    fetch(settings[environment].backend)
      .then(response => {
        setBackendOnline(true);
      }).catch(err => {
        setBackendOnline(false);
      });
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

  useEffect(() => {
    if (!backendOnline) {
      setSelectedTab(RESULT);
    }
    else if (name) {
      setSelectedTab(ASSESSMENT);
    }
  }, [name, backendOnline]);

  if (web3 === null) return <InstallMetamask/>

  return (
    <Web3Context.Provider value={web3}>
      <AccountContext.Provider value={[account, setAccount, name, setName]}>
        <BackendContext.Provider value={backendOnline}>
          <GlobalStyle/>
          <Header
            account={account}
            setAccount={setAccount}
            name={name}
            setName={setName}
          />
          <Tabs
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <ActiveElement/>
        </BackendContext.Provider>
      </AccountContext.Provider>
    </Web3Context.Provider>
  );
}

const GlobalStyle = createGlobalStyle`
  body {
    background: #f0f0f0;
    font-family: arial;
  }
`

const Header = ({ account, setAccount, name, setName }) => {

  return (
    <div
      css={`
        margin-bottom: 20px;
      `}
    >
      <div
        css={`
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 10px;
        `}
      >
        <div
          css={`
            font-size: 18px;
          `}
        >
          coinosis y CKWeb presentan
        </div>
      </div>
      <div
        css={`
          position: relative;
          display: flex;
          justify-content: flex-end;
        `}
      >
        <div
          css={`
            position: absolute;
            bottom: 0px;
            right: 15px;
            display: flex;
          `}
        >
          <Account
            account={account}
            setAccount={setAccount}
            name={name}
            setName={setName}
          />
        </div>
      </div>
      <div
        css={`
          display: flex;
          flex-direction: column;
          align-items: center;
        `}
      >
        <div
          css={`
            font-size: 34px;
          `}
        >
          La música en la cadena de bloques
        </div>
        <div
          css={`
            font-size: 24px;
          `}
        >
          Blockchain en las Artes 2 de 4
        </div>
        <div
          css={`
            font-size: 20px;
            margin-top: 20px;
          `}
        >
          jueves 30 de abril, 4:00pm COL
        </div>
      </div>
    </div>
  );
}

const Tabs = ({ selectedTab, setSelectedTab }) => {

  const backendOnline = useContext(BackendContext);

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
        disabled={!backendOnline}
      />
      <Tab
        id={ASSESSMENT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        disabled={!backendOnline}
      />
      <Tab
        id={RESULT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
    </div>
  );
}

const Tab = ({ id, selectedTab, setSelectedTab, disabled=false }) => {

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
    if (disabled) return;
    setSelectedTab(id);
  }, [disabled]);

  return (
    <StyledTab
      isSelected={isSelected}
      onClick={select}
      disabled={disabled}
    >
      {name}
    </StyledTab>
  );

}

const StyledTab = styled.div`
  padding: 10px;
  background: ${({ isSelected }) => isSelected ? '#e0e0e0' : '#f8f8f8'};
  border: 1px solid #e0e0e0;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  color: ${({ disabled }) => disabled ? '#505050' : 'black'};
`

export default Coinosis
