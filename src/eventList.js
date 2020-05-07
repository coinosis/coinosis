import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountContext, BackendContext } from './coinosis';
import AddEvent from './addEvent';

const privilegedAccounts = [
  '0xeFaC568c637201ea0A944b888b8FB98386eF2882',
  '0xfE1d177037DF1ABbdde4c0E4AFcdE9447F8511D0',
  '0x51e9047a6bBEC3c2a4C03c27382381B129e99e0E',
  '0xbED9793fC4FEe638805464A16c11ef642e16974D',
];

const EventList = () => {

  const { account } = useContext(AccountContext);
  const backendURL = useContext(BackendContext);
  const [events, setEvents] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!backendURL) return;
    fetch(`${backendURL}/events`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      }).then(data => {
        setEvents(data);
      }).catch(err => {
        setEvents([]);
      });
  }, []);

  useEffect(() => {
    if (privilegedAccounts.includes(account)) {
      setShow(true);
    }
    else {
      setShow(false);
    }
  }, [account]);

  return (
    <div>
      <div>
        <AddEvent show={show} setEvents={setEvents} />
      </div>
      <div>
        {events.map(event => {
          return (
            <div key={event._id}>
              <Link to={event.url}>
                {event.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventList;
