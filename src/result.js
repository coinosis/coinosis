import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import contractJson from '../build/contracts/Coinosis.json';
import { Web3Context } from './coinosis';

const ContractContext = createContext();
const CurrencyContext = createContext([]);

const usdPlaceholder = ' '.repeat(4);
const ethPlaceholder = ' '.repeat(5);
const datePlaceholder = ' '.repeat(21);
const percentagePlaceholder = ' '.repeat(4);
const ETH = 'eth';
const USD = 'usd';

const Result = () => {

  const web3 = useContext(Web3Context);

  const [contract, setContract] = useState();
  const [currencyType, setCurrencyType] = useState(ETH);

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

  if (contract === undefined) return <Loading/>
  if (contract === null) return <NoContract/>

  return (
    <ContractContext.Provider value={contract}>
      <CurrencyContext.Provider value={[currencyType, setCurrencyType]}>
        <ContractInfo/>
        <Assessments/>
      </CurrencyContext.Provider>
    </ContractContext.Provider>
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
    <div
      css={`
        display: flex;
        justify-content: center;
        font-size: 34px;
      `}
    >
      <div>
        contrato
      </div>
      <div
        css={`
          margin-left: 5px;
        `}
      >
        <Hash type="address" value={address} />
      </div>
    </div>
  );
}

const Assessments = () => {

  const isMounted = useRef(true);
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
      if (isMounted.current) {
        setAssessments(assessments => [ event.returnValues, ...assessments ]);
      }
    });
    return () => {
      isMounted.current = false;
    }
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
  rewards,
}) => {

  const isMounted = useRef(true);
  const contract = useContext(ContractContext);
  const [transfers, setTransfers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(ethPlaceholder);

  useEffect(() => {
    contract.events.Transfer(
      { fromBlock: 0, filter: {transactionHash: id} },
      (error, event) => {
        if (error) {
          console.error(error);
          return;
        }
        event.returnValues.transactionHash = event.transactionHash;
        if (isMounted.current) {
          setTransfers(transfers => [ ...transfers, event.returnValues ]);
        }
      }
    );
    const totalRewards = rewards.reduce((a, b) => BigInt(a) + BigInt(b))
    const totalBalance = BigInt(totalRewards) - BigInt(totalFeesWei);
    setTotalBalance(String(totalBalance));
    return () => {
      isMounted.current = false;
    }
  }, []);

  return (
    <div
      css={`
        margin: 20px;
        background: #f8f8f8;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #e8e8e8;
        box-shadow: 1px 1px #e8e8e8;
      `}
    >
      <Header
        id={id}
        timestamp={timestamp}
        addresses={addresses}
        registrationFeeUSDWei={registrationFeeUSDWei}
        registrationFeeWei={registrationFeeWei}
        ETHPriceUSDWei={ETHPriceUSDWei}
        totalFeesWei={totalFeesWei}
      />
      <div
        css={`
          margin-top: 15px;
        `}
      >
        <table>
          <thead>
            <tr
              css={`
                background: #d0d0d0;
              `}
            >
              <th>participante</th>
              <th>aplausos</th>
              <th>porcentaje</th>
              <th>recompensa</th>
              <th>balance</th>
              <th
                css={`
                  padding: 10px 20px;
                `}
              >
                estado
              </th>
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
          <tfoot>
            <tr
              css={`
                background: #d0d0d0;
              `}
            >
              <th
                css={`
                  padding: 10px 20px;
                `}
              >total</th>
              <th>
                {totalClaps}
              </th>
              <th>
                100.0 %
              </th>
              <th>
                <Amount
                  eth={totalFeesWei}
                  rate={ETHPriceUSDWei}
                  css={`font-weight: bold`}
                />
              </th>
              <th>
                <Amount
                  eth={totalBalance}
                  rate={ETHPriceUSDWei}
                  css={`font-weight: bold`}
                />
              </th>
              <th/>
            </tr>
          </tfoot>
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
}) => {
  return (
    <div>
      <div
        css={`
          display: flex;
          align-items: flex-end;
        `}
      >
        <div
          css={`
            font-size: 24px;
            display: flex;
          `}
        >
          <div>
            distribución
          </div>
          <div
            css={`
            margin-left: 5px;
          `}
          >
            <Hash type="tx" value={id} />
          </div>
        </div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          <DateTime timestamp={timestamp} />
        </div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          ({addresses.length}
        </div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          participantes)
        </div>
      </div>
      <div
        css={`
          display: flex;
        `}
      >
        <div>aporte por persona:</div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          <Amount
            usd={registrationFeeUSDWei}
            eth={registrationFeeWei}
            rate={ETHPriceUSDWei}
          />
        </div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          aporte total:
        </div>
        <div
          css={`
            margin-left: 5px;
          `}
        >
          <Amount
            eth={totalFeesWei}
            rate={ETHPriceUSDWei}
          />
        </div>
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
  const [fraction, setFraction] = useState('');
  const [balance, setBalance] = useState('');
  const [status, setStatus] = useState('');
  const [tx, setTx] = useState('');
  const [showAddress, setShowAddress] = useState(false);
  const [showFraction, setShowFraction] = useState(false);
  const [showTx, setShowTx] = useState(false);

  useEffect(() => {
    const percentage = 100 * +claps / +totalClaps;
    setPercentage(percentage.toFixed(1) + ' %');
    setFraction(claps + ' / ' + totalClaps);
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
      <td
        css={`
          padding: 10px 30px;
          text-align: center;
        `}
      >
        <ToolTip value={address} show={showAddress} />
        <Link
          type="address"
          value={address}
          internal
          onMouseOver={() => setShowAddress(true)}
          onMouseOut={() => setShowAddress(false)}
        >
          {name}
        </Link>
      </td>
      <td
        css={`
          text-align: center;
          padding: 0 30px;
        `}
      >{claps}</td>
      <td
        css={`
          text-align: center;
          padding: 0 30px;
        `}
      >
        <ToolTip value={fraction} show={showFraction} />
        <div
          onMouseOver={() => setShowFraction(true)}
          onMouseOut={() => setShowFraction(false)}
        >
          {percentage}
        </div>
      </td>
      <td
        css={`
          padding: 0 30px;
        `}
      >
        <Amount eth={reward} rate={rate} />
      </td>
      <td
        css={`
          padding: 0 30px;
        `}
      >
        <Amount
          eth={balance}
          rate={ETHPriceUSDWei}
        />
      </td>
      <td
        css={`
          padding: 0 30px;
        `}
      >
        <ToolTip value={tx} show={showTx} />
        <Link
          type="tx"
          value={tx}
          internal
          onMouseOver={() => setShowTx(true)}
          onMouseOut={() => setShowTx(false)}
        >
          {status}
        </Link>
      </td>
    </tr>
  );
}

const Amount = ({ usd: usdWei, eth: wei, rate: rateWei, ...props }) => {

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
        String(BigInt(wei) * BigInt(rateWei))
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

  return (
    <div>
      <ToolTip value={rate} show={displayRate} />
      <button
        onClick={switchCurrencyType}
        onMouseOver={() => setDisplayRate(true)}
        onMouseOut={() => setDisplayRate(false)}
        css={`
          background: ${currencyType === 'eth' ? '#97b9ca' : '#97cab3'};
          border: none;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        `}
        { ...props }
      >
        {currency}
      </button>
    </div>
  );
}

const ToolTip = ({ value, show }) => {
  return (
    <div css="position: relative">
      <div
        css={`
          display: ${show ? 'block' : 'none'};
          position: absolute;
          bottom: 7px;
          background: black;
          color: #f0f0f0;
          padding: 5px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: normal;
        `}
      >
        {value}
      </div>
    </div>
  );
}

const Hash = ({ type, value }) => {

  const [short, setShort] = useState();
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const length = value.length;
    const short = value.substring(0, 6) + '...' + value.substring(length - 4);
    setShort(short);
  }, [value]);

  return (
    <div>
      <ToolTip value={value} show={showFull} />
      <Link
        type={type}
        value={value}
        onMouseOver={() => setShowFull(true)}
        onMouseOut={() => setShowFull(false)}
      >
        {short}
      </Link>
    </div>
  );
}

const Link = ({ type, value, internal=false, children, ...props }) => {
  
  const [href, setHref] = useState('');

  useEffect(() => {
    let href = `https://etherscan.io/${type}/${value}`;
    if (internal) {
      href += '#internal';
      if (type === 'address') {
        href += 'tx';
      }
    }
    setHref(href);
  }, [value]);
  
  return (
    <a
      href={href}
      target="_blank"
      {...props}
      css={`
        color: black;
        &:visited {
          color: black;
        }
      `}
    >
      {children}
    </a>
  );
}

const DateTime = ({ timestamp }) => {
  
  const [date, setDate] = useState(datePlaceholder);

  useEffect(() => {
    const date = new Date(timestamp * 1000);
    setDate(date.toLocaleString());
  }, [ timestamp ]);

  return (
    <div>
      {date}
    </div>
  );
}

const Loading = () => {
  return <div>por favor espera...</div>
}

const NoContract = () => {
  return (
    <div>
      ningún contrato ha sido desplegado en esta red.
    </div>
  )
}

export default Result
