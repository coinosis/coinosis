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
import contractJson from '../build/contracts/Coinosis.json';
import { environment, Hash, Loading, NoContract } from './helpers';
import settings from './settings.json';
import Account from './account';
import Registration from './registration';
import Assessment from './assessment';
import Result from './result';

export const REGISTRATION = Symbol('REGISTRATION');
const ASSESSMENT = Symbol('ASSESSMENT');
const RESULT = Symbol('RESULT');

export const Web3Context = createContext();
export const AccountContext = createContext();
export const ContractContext = createContext();
export const BackendContext = createContext();

const Coinosis = () => {

  const [web3, setWeb3] = useState();
  const [contract, setContract] = useState();
  const [account, setAccount] = useState();
  const [name, setName] = useState();
  const [selectedTab, setSelectedTab] = useState(REGISTRATION);
  const [ActiveElement, setActiveElement] = useState(() => Registration);
  const [backendOnline, setBackendOnline] = useState();
  const [assessmentSent, setAssessmentSent] = useState();

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

  const preSetName = useCallback(newName => {
    if (newName && name === undefined) {
      setSelectedTab(ASSESSMENT);
    }
    setName(newName);
  }, [name]);

  const preSetAssessmentSent = useCallback(newSent => {
    if(assessmentSent === undefined && newSent) {
      setAssessmentSent(newSent);
      setSelectedTab(RESULT);
    } else {
      setAssessmentSent(newSent);
    }
  }, [assessmentSent]);

  useEffect(() => {
    if (backendOnline === false) {
      setSelectedTab(RESULT);
    }
  }, [backendOnline]);

  if (web3 === null) return <InstallMetamask/>
  if (contract === undefined) return <Loading/>
  if (contract === null) return <NoContract/>

  return (
    <Web3Context.Provider value={web3}>
      <ContractContext.Provider value={contract}>
        <AccountContext.Provider
          value={[account, setAccount, name, preSetName]}
        >
          <BackendContext.Provider value={backendOnline}>
            <GlobalStyle/>
            <Header/>
            <Tabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
            <ActiveElement
              setSelectedTab={setSelectedTab}
              sent={assessmentSent}
              setSent={preSetAssessmentSent}
            />
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
  }
`

const Header = () => {

  return (
    <div
      css={`
        display: flex;
        justify-content: space-between;
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
        coinosis
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
        disabled={backendOnline === false}
      />
      <Tab
        id={ASSESSMENT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        disabled={backendOnline === false}
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
        {version ? `(v${version})` : ''}
      </div>
    </div>
  );
}

export default Coinosis
