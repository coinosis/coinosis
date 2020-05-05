import React, { useContext, useEffect, useCallback, useState } from 'react';
import { AccountContext, BackendContext } from './coinosis';
import { usePost } from './helpers';

const AddEvent = ({ show }) => {

  const post = usePost();
  const backendURL = useContext(BackendContext);
  const [account] = useContext(AccountContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [start, setStart] = useState('');
  const [startValid, setStartValid] = useState(true);
  const [end, setEnd] = useState('');
  const [endValid, setEndValid] = useState(true);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    setFormValid(
      name !== ''
        && description !== ''
        && fee !== ''
        && start !== ''
        && startValid
        && end !== ''
        && endValid
    );
  }, [name, description, fee, start, startValid, end, endValid]);

  const preSetFee = useCallback(e => {
    const value = e.target.value;
    if (value === '') {
      setFee(value);
      return;
    }
    const number = Number(value);
    const positive = Math.abs(number);
    const rounded = Math.round(positive * 100) / 100;
    setFee(rounded);
  }, []);

  const preSetStart = useCallback(e => {
    const { value } = e.target;
    setStart(value);
    setStartValid(isDateValid(value));
  }, []);

  const preSetEnd = useCallback(e => {
    const { value } = e.target;
    setEnd(value);
    setEndValid(isDateValid(value));
  }, []);

  const isDateValid = useCallback((value, set) => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }, []);

  const add = useCallback(() => {
    const organizer = account;
    const object = {name, description, fee, start, end, organizer};
    post('events', object, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(data);
    });
  }, [name, description, fee, start, end, account]);

  if (!show) return <div/>

  return (
    <div>
      <Field
        label="nombre del evento"
        element={
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            css={`
              width: 300px;
            `}
          />
        }
      />
      <Field
        label="descripción"
        element={
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            css={`
              width: 300px;
              height: 200px;
            `}
          />
        }
      />
      <Field
        label="costo de inscripción"
        element={
          <input
            value={fee}
            onChange={preSetFee}
            type="number"
            min={0}
            step={0.01}
            css={`
              width: 60px;
            `}
          />
        }
        unit="USD"
      />
      <Field
        label="fecha y hora de inicio"
        element={
          <input
            type="datetime-local"
            value={start}
            onChange={preSetStart}
            css={`
              border: 1px solid ${startValid ? 'rgb(169, 169, 169)' : 'red'};
            `}
          />
         }
      />
      <Field
        label="fecha y hora de finalización"
        element={
          <input
            type="datetime-local"
            value={end}
            onChange={preSetEnd}
            css={`
              border: 1px solid ${endValid ? 'rgb(169, 169, 169)' : 'red'};
            `}
          />
         }
      />
      <div>
        <button
          disabled={!formValid}
          onClick={add}
        >
          crear
        </button>
      </div>
    </div>
  );
}

const Field = ({ label, element, unit }) => {
  return (
    <div
      css={`
        display: flex;
      `}
    >
      <div>
        {label}
      </div>
      <div
        css={`
          margin: 0 5px;
        `}
      >
        {element}
      </div>
      <div>
        {unit}
      </div>
    </div>
  );
}

export default AddEvent;