import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AccountContext, BackendContext } from './coinosis';
import { Link, formatDate, SectionTitle } from './helpers';
import AddEvent from './addEvent';

const privilegedAccounts = [
  '0xeFaC568c637201ea0A944b888b8FB98386eF2882',
  '0xfE1d177037DF1ABbdde4c0E4AFcdE9447F8511D0',
  '0x51e9047a6bBEC3c2a4C03c27382381B129e99e0E',
  '0xbED9793fC4FEe638805464A16c11ef642e16974D',
  '0xe1fF19182deb2058016Ae0627c1E4660A895196a',
];

const EventList = () => {

  const { account } = useContext(AccountContext);
  const backendURL = useContext(BackendContext);
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [live, setLive] = useState([]);
  const [past, setPast] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);

  useEffect(() => {
    if (!backendURL) return;
    fetch(`${backendURL}/events`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      }).then(data => {
        const events = data.map(event => {
          return {
            startDate: new Date(event.start),
            endDate: new Date(event.end),
            ...event,
          };
        });
        const sortedEvents = events.sort((a, b) => {
          return b.startDate - a.startDate;
        });
        setEvents(sortedEvents);
      }).catch(err => {
        setEvents([]);
      });
  }, []);

  useEffect(() => {
    const now = new Date();
    const upcoming = events.filter(event => now < event.startDate);
    const live = events.filter(event =>
      now >= event.startDate
        && now <= event.endDate
    );
    const past = events.filter(event => now > event.endDate);
    setUpcoming(upcoming);
    setLive(live);
    setPast(past);
  }, [events]);

  useEffect(() => {
    if (privilegedAccounts.includes(account)) {
      setShowAddEvent(true);
    }
    else {
      setShowAddEvent(false);
    }
  }, [account]);

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <EventSection
        title="eventos sucediendo en este momento"
        events={live}
      />
      <EventSection
        title="próximos eventos"
        events={upcoming}
      />
      <div
        css={`
          display: ${showAddEvent ? 'flex' : 'none'};
          flex-direction: column;
          align-items: center;
        `}
      >
        <SectionTitle>
          crea un nuevo evento
        </SectionTitle>
        <AddEvent setEvents={setEvents} />
    </div>
      <EventSection
        title="eventos pasados"
        events={past}
      />
    </div>
  );
}

const EventSection = ({ title, events }) => {
  return (
    <div
      css={`
        display: ${events.length ? 'flex' : 'none'};
        flex-direction: column;
        align-items: center;
      `}
    >
      <SectionTitle>
        {title}
      </SectionTitle>
      <div
        css={`
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 18px;
        `}
      >
        <table>
          <tbody>
            {events.map(event => {
              return (
                <tr key={event._id}>
                  <td>
                    <Link to={event.url}>
                      {event.name}
                    </Link>
                  </td>
                  <td>
                    {formatDate(event.startDate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EventList;
