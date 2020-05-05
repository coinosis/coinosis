import React, { useContext, useEffect, useState } from 'react';
import { BackendContext } from './coinosis';
import AddEvent from './addEvent';

const EventList = ({ setEvent }) => {

  const backendURL = useContext(BackendContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
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

  return (
    <div>
      <div>
        <AddEvent show />
      </div>
      <div>
        {events.map(event => {
          return (
            <div key={event._id}>
              {event.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EventList;
