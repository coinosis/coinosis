import React, {useCallback, useContext } from 'react';
import { AccountContext } from './coinosis';
import { Amount, Loading, usePost } from './helpers';
import Account from './account';

const Attendance = ({ url, fee, attendees, setAttendees }) => {

  const { account, name } = useContext(AccountContext);
  const post = usePost();

  const attend = useCallback(() => {
    const object = { attendee: account, event: url };
    post('attend', object, (error, data) => {
      if (error) {
        console.log(error);
        return;
      }
      setAttendees(data.attendees);
    });
  }, [url, account]);

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

  if (!attendees.includes(account)) {
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
            <Amount usd={String(fee)} rate="1" />
          </div>
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
