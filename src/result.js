import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ContractContext, Web3Context } from './coinosis';
import { Amount, Loading, ToolTip, Hash, EtherscanLink } from './helpers';

const Result = ({ url: eventURL }) => {
  return <Assessments eventURL={eventURL} />
}

const Assessments = ({ eventURL }) => {

  const isMounted = useRef(true);
  const web3 = useContext(Web3Context);
  const contract = useContext(ContractContext);
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    if (!contract) return;
    const topics = [ null, web3.utils.sha3(eventURL) ];
    contract.events.Assessment({fromBlock: 0, topics }, (error, event) => {
      if (error) {
        console.error(error);
        return;
      }
      event.returnValues.id = event.transactionHash;
      event.returnValues.blockNumber = event.blockNumber;
      if (isMounted.current) {
        setAssessments(assessments => [ event.returnValues, ...assessments ]);
      }
    });
    return () => {
      isMounted.current = false;
    }
  }, []);

  if (!assessments.length) {
    return (
      <div
        css={`
          display: flex;
          justify-content: center;
        `}
      >
        aquí aparecerá la distribución apenas ocurra.
      </div>
    );
  }

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
  blockNumber,
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

  const [totalBalance, setTotalBalance] = useState();

  useEffect(() => {
    const totalRewards = rewards.reduce((a, b) => BigInt(a) + BigInt(b))
    const totalBalance = BigInt(totalRewards) - BigInt(totalFeesWei);
    setTotalBalance(String(totalBalance));
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
              return (
                <Participant
                  key={address}
                  blockNumber={blockNumber}
                  name={names[i]}
                  address={addresses[i]}
                  claps={claps[i]}
                  totalClaps={totalClaps}
                  reward={rewards[i]}
                  rate={ETHPriceUSDWei}
                  registrationFeeWei={registrationFeeWei}
                  ETHPriceUSDWei={ETHPriceUSDWei}
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
                { totalBalance && (
                  <Amount
                    eth={totalBalance}
                    rate={ETHPriceUSDWei}
                    css={`font-weight: bold`}
                  />
                )}
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
  blockNumber,
  name,
  address,
  claps,
  totalClaps,
  reward,
  rate,
  registrationFeeWei,
  ETHPriceUSDWei,
}) => {

  const isMounted = useRef(true);
  const contract = useContext(ContractContext);
  const [percentage, setPercentage] = useState();
  const [fraction, setFraction] = useState('');
  const [balance, setBalance] = useState('');
  const [tx, setTx] = useState('');
  const [showFraction, setShowFraction] = useState(false);

  useEffect(() => {
    const percentage = 100 * +claps / +totalClaps;
    setPercentage(percentage.toFixed(1) + ' %');
    setFraction(claps + ' / ' + totalClaps);
    const balance = reward - registrationFeeWei;
    setBalance(String(balance));
  }, []);

  useEffect(() => {
    contract.events.Transfer(
      { fromBlock: blockNumber, filter: {addr: address} },
      (error, event) => {
        if (error) {
          console.error(error);
          return;
        }
        if (event.returnValues.addr !== address) return;
        if (isMounted.current) {
          setTx(event.transactionHash);
        }
      }
    );
    return () => {
      isMounted.current = false;
    }
  }, []);

  return (
    <tr>
      <td
        css={`
          padding: 10px 30px;
          text-align: center;
        `}
      >
        <EtherscanLink
          type="address"
          value={address}
          internal
        >
          {name}
        </EtherscanLink>
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
        <Status tx={tx} />
      </td>
    </tr>
  );
}

const Status = ({tx}) => {

  if (!tx) return <div/>

  return (
    <EtherscanLink
      type="tx"
      value={tx}
      internal
    >
      enviada
    </EtherscanLink>
  );
}

const DateTime = ({ timestamp }) => {
  
  const [date, setDate] = useState();

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

export default Result
