import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Web3Context, AccountContext } from './coinosis';
import { Amount, Loading, usePost } from './helpers';
import Account from './account';

const Attendance = ({ url, fee, organizer, attendees, setAttendees }) => {

  const web3 = useContext(Web3Context);
  const { account, name } = useContext(AccountContext);
  const post = usePost();
  const [feeUSDWei, setFeeUSDWei] = useState();

  useEffect(() => {
    const feeUSDWei = web3.utils.toWei(String(fee));
    setFeeUSDWei(feeUSDWei);
  }, [fee]);

  const attend = useCallback(() => {
    const object = { attendee: account, event: url };
    post('attend', object, (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
      setAttendees(attendees => [ ...attendees, {address: account, name} ]);
    });
  }, [url, account, name]);

  if (account === null) {
    return (
      <div
        css={`
          display: flex;
          justify-content: center;
        `}
      >
        <Account />
      </div>
    );
  }

  if (name === undefined) return <Loading/>

  if (name === null) {
    return <Account/>
  }

  if (account === organizer) {
    return (
      <div
        css={`
          display: flex;
          justify-content: center;
        `}
      >
        <div>
          tú creaste este evento.
        </div>
      </div>
    );
  }

  if (!attendees.map(a => a.address).includes(account)) {
    return (
      <div
        css={`
          display: flex;
          flex-direction: column;
          align-items: center;
        `}
      >
        <div
          css={`
            display: flex;
          `}
        >
          <div>
            este evento tiene un costo de
          </div>
          <div
            css={`
              margin: 0 5px;
            `}
          >
            <Amount usd={feeUSDWei} />
          </div>
        </div>
        <div>
          <div>
            <button
              onClick={attend}
            >
              inscríbete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      css={`
        display: flex;
        justify-content: center;
      `}
    >
      <div>
        vas a asistir a este evento.
      </div>
    </div>
  );
}

export default Attendance;
