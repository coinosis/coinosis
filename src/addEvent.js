import React, { useContext, useEffect, useCallback, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/esm/locale';
import {
  addHours,
  setHours,
  addMinutes,
  setMinutes,
  subMinutes
} from 'date-fns';
import { AccountContext, BackendContext } from './coinosis';
import { formatDate, usePost } from './helpers';

registerLocale('es', es);

const AddEvent = ({ setEvents }) => {

  const post = usePost();
  const backendURL = useContext(BackendContext);
  const { account, name: userName } = useContext(AccountContext);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [now] = useState(new Date());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [minutesBefore, setMinutesBefore] = useState(30);
  const [minutesAfter, setMinutesAfter] = useState(30);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    setFormValid(
      name !== ''
        && url !== ''
        && description !== ''
        && fee !== ''
        && start !== ''
        && end !== ''
        && userName !== null
    );
  }, [name, url, description, fee, start, end, userName]);

  const preSetName = useCallback(e => {
    const value = e.target.value;
    setName(value);
    setUrl(value
           .toLowerCase()
           .replace(/ /g, '-')
           .replace(/á/g, 'a')
           .replace(/é/g, 'e')
           .replace(/í/g, 'i')
           .replace(/ó/g, 'o')
           .replace(/ú/g, 'u')
           .replace(/ñ/g, 'n')
           .replace(/ü/g, 'u')
           .replace(/[^a-z0-9-]/g, '')
           .substring(0, 60)
          );
  }, []);

  const preSetUrl = useCallback(e => {
    const value = e.target.value;
    if(/^[a-z0-9-]{1,60}$/.test(value)) {
      setUrl(value);
    }
  }, []);

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

  const preSetStart = useCallback(start => {
    setStart(start);
    setEnd(addHours(start, 1));
  }, []);

  const makeNatural = useCallback(value => {
    const number = Number(value);
    const positive = Math.abs(number);
    const integer = Math.floor(positive);
    return integer;
  }, []);

  const preSetMinutesBefore = useCallback(e => {
    const { value } = e.target;
    const natural = makeNatural(value);
    setMinutesBefore(natural);
  });

  const preSetMinutesAfter = useCallback(e => {
    const { value } = e.target;
    const natural = makeNatural(value);
    setMinutesAfter(natural);
  });

  const add = useCallback(() => {
    const organizer = account;
    const beforeStart = subMinutes(start, minutesBefore);
    const afterEnd = addMinutes(end, minutesAfter);
    const object = {
      name,
      url,
      description,
      fee,
      start,
      end,
      beforeStart,
      afterEnd,
      organizer,
    };
    post('events', object, (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      data.startDate = start;
      data.endDate = end;
      setEvents(events => [...events, data]);
      setName('');
      setUrl('');
      setDescription('');
      setFee('');
      setStart('');
      setEnd('');
      setMinutesBefore(30);
      setMinutesAfter(30);
    });
  }, [
    name,
    url,
    description,
    fee,
    start,
    end,
    minutesBefore,
    minutesAfter,
    account,
  ]);

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      `}
    >
      <table
        css={`
          width: 100%;
        `}
      >
        <tbody>
          <Field
            label="nombre del evento:"
            element={
              <input
                value={name}
                onChange={preSetName}
                css={`
                  width: 500px;
                `}
              />
            }
          />
          <Field
            label="URL:"
            element={
              <div
                css={`
                  font-family: monospace;
                `}
              >
                https://coinosis.github.io/#/
                <input
                  value={url}
                  onChange={preSetUrl}
                  css={`
                    width: 273px;
                  `}
                />
              </div>
            }
          />
          <Field
            label="descripción:"
            element={
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                css={`
                  width: 498px;
                  height: 200px;
                `}
              />
            }
          />
          <Field
            label="costo de inscripción:"
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
            label="fecha y hora de inicio:"
            element={
              <DatePicker
                dateFormat="dd 'de' MMMM 'de' yyyy, h:mm aa"
                selected={start}
                onChange={preSetStart}
                showTimeSelect
                timeCaption="hora"
                timeFormat="h:mm aa"
                timeIntervals={30}
                minDate={now}
                locale="es"
              />
            }
          />
          <Field
            label="fecha y hora de finalización:"
            element={
              <DatePicker
                dateFormat="dd 'de' MMMM 'de' yyyy, h:mm aa"
                selected={end}
                onChange={setEnd}
                showTimeSelect
                timeCaption="hora"
                timeFormat="h:mm aa"
                timeIntervals={30}
                minDate={start || now}
                locale="es"
              />
            }
          />
          <Field
            label="comenzar la videoconferencia"
            element={
              <input
                value={minutesBefore}
                onChange={preSetMinutesBefore}
                type="number"
                min={0}
                step={1}
                css={`
                  width: 60px;
                `}
              />
            }
            unit="minutos antes"
          />
          <Field
            label="y finalizarla"
            element={
              <input
                value={minutesAfter}
                onChange={preSetMinutesAfter}
                type="number"
                min={0}
                step={1}
                css={`
                  width: 60px;
                `}
              />
            }
            unit="minutos después"
          />
          <tr>
            <td/>
            <td>
              <button
                disabled={!formValid}
                onClick={add}
              >
                crear
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const Field = ({ label, element, unit }) => {
  return (
    <tr>
      <td
        css={`
          width: 50%;
          text-align: end;
          vertical-align: top;
        `}
      >
        {label}
      </td>
      <td
        css={`
          width: 50%;
        `}
      >
        {element} {unit}
      </td>
    </tr>
  );
}

export default AddEvent;
