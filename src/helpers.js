import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Web3Context,
  AccountContext,
  BackendContext,
  CurrencyContext,
  ETH,
  USD,
} from './coinosis';

export const environment = process.env.ENVIRONMENT || 'development';

export const Loading = () => {
  return (
    <div
      css={`
        display: flex;
        justify-content: center;
      `}
    >
      por favor espera...
    </div>
  );
}

export const ToolTip = ({ value, show, position="top" }) => {

  return (
    <div css="position: relative">
      <div
        css={`
          display: ${show ? 'block' : 'none'};
          position: absolute;
          ${ position !== 'top' ? 'top: 25px;' : 'bottom: 7px'};
          ${ position === 'bottomRight' ? 'right: 0' 
             : position === 'bottomLeft' ? 'left: 0' : '' };
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

export const Hash = ({ type, value, toolTipPosition="top" }) => {

  const [short, setShort] = useState();
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const length = value.length;
    const short = value.substring(0, 6) + '...' + value.substring(length - 4);
    setShort(short);
  }, [value]);

  return (
    <div>
      <EtherscanLink
        type={type}
        value={value}
        onMouseOver={() => setShowFull(true)}
        onMouseOut={() => setShowFull(false)}
        toolTipPosition={toolTipPosition}
      >
        {short}
      </EtherscanLink>
    </div>
  );
}

export const Link = ({ onClick, children }) => {
  return (
    <span
      onClick={onClick}
      css={`
        margin-right: 5px;
        text-decoration: underline;
        cursor: pointer;
      `}
    >
      {children}
    </span>
  );
}

export const EtherscanLink = ({
  type,
  value,
  internal=false,
  children,
  toolTipPosition="top",
  ...props
}) => {

  const [href, setHref] = useState('');
  const [showToolTip, setShowToolTip] = useState(false);

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
    <div>
      <ToolTip
        value={value}
        show={showToolTip}
        position={toolTipPosition}
      />
      <a
        href={href}
        target="_blank"
        {...props}
        css={`
          color: black;
          &:visited {
            color: black;
          }
          white-space: nowrap;
        `}
        onMouseOver={() => setShowToolTip(true)}
        onMouseOut={() => setShowToolTip(false)}
        tabIndex={-1}
      >
        {children}
      </a>
    </div>
  );
}

export const usePost = () => {

  const { account } = useContext(AccountContext);
  const backendURL = useContext(BackendContext);
  const web3 = useContext(Web3Context);

  return useCallback((endpoint, object, callback) => {
    const payload = JSON.stringify(object);
    const hex = web3.utils.utf8ToHex(payload);
    web3.eth.personal.sign(hex, account).then(signature => {
      object.signature = signature;
      const body = JSON.stringify(object);
      fetch(`${backendURL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        } else {
          return response.json();
        }
      }).then(data => {
        callback(null, data);
      }).catch(err => {
        callback(err, null);
      });
    });
  }, [account, backendURL, web3]);
}

export const NoContract = () => {
  return (
    <div>
      ningún contrato ha sido desplegado en esta red.
    </div>
  )
}

export const Amount = ({ usd: usdWei, eth: wei, rate: rateWei, ...props }) => {

  const web3 = useContext(Web3Context);
  const [currencyType, setCurrencyType] = useContext(CurrencyContext);

  const [usd, setUSD] = useState();
  const [eth, setETH] = useState();
  const [currency, setCurrency] = useState();
  const [rate, setRate] = useState();
  const [displayRate, setDisplayRate] = useState(false);

  useEffect(() => {
    if (!usdWei && !wei) return;
    if (!rateWei) {
      rateWei = web3.utils.toWei('200'); // TODO
    }
    if (!usdWei) {
      usdWei = String(Math.round(web3.utils.fromWei(
        String(BigInt(wei) * BigInt(rateWei))
      )));
    }
    else if (!wei) {
      wei = String(BigInt(usdWei) * BigInt(1e18) / BigInt(rateWei));
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
          background: ${currencyType === ETH ? '#97b9ca' : '#97cab3'};
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
