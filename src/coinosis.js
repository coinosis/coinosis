import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import coinosisJson from '../build/contracts/Coinosis.json';

const coinosisAddress = '0xBf660E18795cC6167cB4a5C71c7708EF6D91dED8';

const Coinosis = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  const [events] = useState([]);
  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider);
    web3.eth.requestAccounts().then(accounts => setAccount(accounts[0]));
    const contract = new web3.eth.Contract(coinosisJson.abi, coinosisAddress);
    setContract(contract);
    contract.events.Received({fromBlock: 0}, (error, event) => {
      if (error) {
        console.error(error);
        return;
      }
      const { name, amount, sender } = event.returnValues;
      const newEvent = { name, amount, sender };
      events.push(newEvent);
    });
  }, []);
  const submit = () => {
    contract.methods.receive(name).send({value: amount, from: account});
    setName('');
    setAmount('');
  }
  console.log(events.length);
  return (
    <div>
      <div>
        <div>
          <div>
            Name
          </div>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <div>
            Amount
          </div>
          <input value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <button onClick={submit}>
            Submit
          </button>
        </div>
      </div>
      <div>
        {events.map(event => {
          return (
            <div key={event.name}>
              <div>
                {event.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default Coinosis
