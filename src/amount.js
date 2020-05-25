import "regenerator-runtime/runtime";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Web3Context,
  BackendContext,
  CurrencyContext,
  ETH,
  USD,
} from './coinosis';
import settings from './settings.json';
import { environment, ToolTip } from './helpers.js';

const Amount = ({ usd: usdWei, eth: wei, rate: rateWei, ...props }) => {

  const web3 = useContext(Web3Context);
  const backendURL = useContext(BackendContext);
  const [currencyType, setCurrencyType] = useContext(CurrencyContext);

  const [usd, setUSD] = useState();
  const [eth, setETH] = useState();
  const [currency, setCurrency] = useState();
  const [rate, setRate] = useState();
  const [displayRate, setDisplayRate] = useState(false);

  useEffect(() => {
    const setValues = async () => {
      if (!usdWei && !wei) return;
      if (!rateWei) {
        let rate;
        let response;
        try {
          response = await fetch(`${backendURL}/eth/price`);
          if (!response.ok) {
            throw new Error(response.status);
          }
          const data = await response.json();
          rate = data;
        } catch (err) {
          rate = '200';
        }
        rateWei = web3.utils.toWei(rate);
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
    }
    setValues();
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

export default Amount;
