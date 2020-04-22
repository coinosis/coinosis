import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import Web3 from 'web3';
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
  const [contract, setContract] = useState();
  const [currencyType, setCurrencyType] = useState(ETH);

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider);
    setWeb3(web3);
    const networkIds = Object.keys(contractJson.networks);
    const latestNetworkId = networkIds[networkIds.length -1];
    const contractAddress = contractJson.networks[latestNetworkId].address;
    const contract = new web3.eth.Contract(contractJson.abi, contractAddress);
    setContract(contract);
  }, []);

  if (!contract) return <Loading/>

  return (
    <Web3Context.Provider value={web3}>
      <ContractContext.Provider value={contract}>
        <CurrencyContext.Provider value={[currencyType, setCurrencyType]}>
          <ContractInfo />
          <Assessments />
        </CurrencyContext.Provider>
      </ContractContext.Provider>
    </Web3Context.Provider>
  );
}

const ContractInfo = () => {

  const contract = useContext(ContractContext);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (contract) {
      setAddress(contract._address);
    }
  }, [contract]);

  return (
    <div>
      <div>
        contrato
      </div>
      <div>
        <Link type="address" data={address}>
          {address}
        </Link>
      </div>
    </div>
  );
}

const Assessments = () => {
  
  const contract = useContext(ContractContext);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    if (!contract) return;
    contract.events.Assessment({fromBlock: 0}, (error, event) => {
      if (error) {
        console.error(error);
        return;
      }
      event.returnValues.id = event.transactionHash;
      setAssessments(assessments => [ event.returnValues, ...assessments ]);
    });
  }, []);

  return (
    <div>
      {assessments.map(assessment => {
        return (
          <Assessment key={assessment.id} { ...assessment } />
        );
      })}
    </div>
  );
  
}

const Assessment = ({
  id,
  timestamp,
  registrationFeeUSDWei,
  ETHPriceUSDWei,
  names,
  addresses,
  claps,
  registrationFeeWei,
  totalFeesWei,
  totalClaps,
  rewards
}) => {

  const contract = useContext(ContractContext);
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    contract.events.Transfer(
      { fromBlock: 0, filter: {transactionHash: id} },
      (error, event) => {
        if (error) {
          console.error(error);
          return;
        }
        event.returnValues.transactionHash = event.transactionHash;
        setTransfers(transfers => [ ...transfers, event.returnValues ]);
      });
  }, []);

  return (
    <div>
      <Header
        id={id}
        timestamp={timestamp}
        addresses={addresses}
        registrationFeeUSDWei={registrationFeeUSDWei}
        registrationFeeWei={registrationFeeWei}
        ETHPriceUSDWei={ETHPriceUSDWei}
        totalFeesWei={totalFeesWei}
        totalClaps={totalClaps}
      />
      <div>
        <table>
          <thead>
            <tr>
              <th>participante</th>
              <th>aplausos</th>
              <th>porcentaje</th>
              <th>recompensa</th>
              <th>balance</th>
              <th>estado</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map((address, i) => {
              const transferFilter = transfers.filter(transfer => (
                transfer.addr === address
              ));
              return (
                <Participant
                  key={address}
                  name={names[i]}
                  address={addresses[i]}
                  claps={claps[i]}
                  totalClaps={totalClaps}
                  reward={rewards[i]}
                  rate={ETHPriceUSDWei}
                  registrationFeeWei={registrationFeeWei}
                  ETHPriceUSDWei={ETHPriceUSDWei}
                  transferFilter={transferFilter}
                />
              );
            })}

          </tbody>
        </table>
      </div>
    </div>
  );
}

const Header = ({
  id,
  timestamp,
  addresses,
  registrationFeeUSDWei,
  registrationFeeWei,
  ETHPriceUSDWei,
  totalFeesWei,
  totalClaps
}) => {
  return (
    <div>
      <div>
        <div>
          distribución
        </div>
        <div>
          <Link type="tx" data={id}>
            {id}
          </Link>
        </div>
      </div>
      <div>
        <DateTime timestamp={timestamp} />
      </div>
      <div>
        <div>
          <div>participantes</div>
          <div>{addresses.length}</div>
        </div>
      </div>
      <div>
        <div>aporte por persona</div>
        <Amount
          usd={registrationFeeUSDWei}
          eth={registrationFeeWei}
          rate={ETHPriceUSDWei}
        />
      </div>
      <div>
        <div>aporte total</div>
        <Amount
          eth={totalFeesWei}
          rate={ETHPriceUSDWei}
        />
      </div>
      <div>
        <div>total aplausos</div>
        <div>{totalClaps}</div>
      </div>
    </div>
  )
}

const Participant = ({
  name,
  address,
  claps,
  totalClaps,
  reward,
  rate,
  registrationFeeWei,
  ETHPriceUSDWei,
  transferFilter,
}) => {

  const [percentage, setPercentage] = useState(percentagePlaceholder);
  const [balance, setBalance] = useState('');
  const [status, setStatus] = useState('');
  const [tx, setTx] = useState('');


  useEffect(() => {
    const percentage = 100 * +claps / +totalClaps;
    setPercentage(percentage.toFixed(1) + ' %');
    const balance = reward - registrationFeeWei;
    setBalance(String(balance));
  }, []);

  useEffect(() => {
    if (transferFilter.length) {
      setStatus('enviada');
      setTx(transferFilter[0].transactionHash);
    }
  }, [ transferFilter ]);

  return (
    <tr>
      <td>
        <Link type="address" data={address}>
          {name}
        </Link>
      </td>
      <td>{claps}</td>
      <td>{percentage}</td>
      <td>
        <Amount eth={reward} rate={rate} />
      </td>
      <td>
        <Amount
          eth={balance}
          rate={ETHPriceUSDWei}
        />
      </td>
      <td>
        <Link type="tx" data={tx}>
          {status}
        </Link>
      </td>
    </tr>
  );
}

const Amount = ({ usd: usdWei, eth: wei, rate: rateWei }) => {

  const web3 = useContext(Web3Context);
  const [currencyType, setCurrencyType] = useContext(CurrencyContext);

  const [usd, setUSD] = useState(usdPlaceholder);
  const [eth, setETH] = useState(ethPlaceholder);
  const [currency, setCurrency] = useState(ethPlaceholder);
  const [rate, setRate] = useState(usdPlaceholder);
  const [displayRate, setDisplayRate] = useState(false);
  
  useEffect(() => {
    if(!usdWei) {
      usdWei = String(Math.round(web3.utils.fromWei(
        String(BigInt(wei * rateWei))
      )));
    }
    setUSD(Number(web3.utils.fromWei(usdWei)).toFixed(2) + ' USD');
    setETH(Number(web3.utils.fromWei(wei)).toFixed(3) + ' ETH');
    setRate(Number(web3.utils.fromWei(rateWei)).toFixed(2) + ' USD/ETH');
  }, [ usdWei, wei, rateWei ]);

  useEffect(() => {
    setCurrency(currencyType === ETH ? eth : usd);
  }, [ currencyType, eth, usd ]);

  const switchCurrencyType = useCallback(() => {
    setCurrencyType(currencyType => currencyType === ETH ? USD : ETH);
  }, []);

  const showRate = useCallback(() => {
    setDisplayRate(true);
  }, []);

  const hideRate = useCallback(() => {
    setDisplayRate(false);
  }, []);

  return (
    <div css="position: relative">
      <div
        css={`
          display: ${displayRate ? 'block' : 'none'};
          position: absolute;
          bottom: 30px;
          background: black;
          color: white;
          width: 150px;
          left: -30px;
          text-algin: center;
        `}
        show={displayRate}
      >
        {rate}
      </div>
      <button
        onClick={switchCurrencyType}
        onMouseOver={showRate}
        onMouseOut={hideRate}
      >
        {currency}
      </button>
    </div>
  );
}

const Link = ({ type, data, children }) => {
  
  const [href, setHref] = useState('');

  useEffect(() => {
    let href = `https://etherscan.io/${type}/${data}`;
    setHref(href);
  }, [data]);
  
  return (
    <a href={href} target="_blank">
      {children}
    </a>
  );
}

const DateTime = ({ timestamp }) => {
  
  const [date, setDate] = useState(datePlaceholder);

  useEffect(() => {
    setDate(new Date(timestamp * 1000).toLocaleString());
  }, [ timestamp ]);

  return (
    <div>
      {date}
    </div>
  );
}

const Loading = () => {
  return <div>loading...</div>
}

export default Coinosis
