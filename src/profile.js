import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faAt,
  faCheckCircle,
  faEdit,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { faEthereum, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { AccountContext } from './coinosis';
import { Hash, Link, Loading, SectionTitle, usePost } from './helpers';
import { isEmail, isTelegram } from './common';
import Account from './account';

const Profile = () => {

  const post = usePost();
  const { name, account, data, setData } = useContext(AccountContext);
  const [email, setEmail] = useState();
  const [editingEmail, setEditingEmail] = useState();
  const [telegram, setTelegram] = useState();
  const [editingTelegram, setEditingTelegram] = useState();

  useEffect(() => {
    if (data === undefined) return;
    if (data === null) {
      setEmail(null);
      setEditingEmail(true);
      setTelegram(null);
      setEditingTelegram(true);
      return;
    }
    if ('email' in data) {
      setEmail(data.email);
      setEditingEmail(false);
    } else {
      setEmail(null);
      setEditingEmail(true);
    }
    if ('telegram' in data) {
      setTelegram(data.telegram);
      setEditingTelegram(false);
    } else {
      setTelegram(null);
      setEditingTelegram(true);
    }
  }, [ data ]);

  const registerEmail = useCallback(newEmail => {
    if (email === newEmail) {
      setEditingEmail(false);
      return;
    }
    post(
      `user/${account}`,
      { email: newEmail },
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        setEditingEmail(false);
        setEmail(data.email);
        setData(data);
      },
      'PUT'
    );
  }, [ account, email ]);

  const registerTelegram = useCallback(newTelegram => {
    if (!newTelegram.startsWith('@')) {
      newTelegram = `@${newTelegram}`;
    }
    if (telegram === newTelegram) {
      setEditingTelegram(false);
      return;
    }
    post(
      `user/${account}`,
      { telegram: newTelegram },
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        setEditingTelegram(false);
        setTelegram(data.telegram);
        setData(data);
      },
      'PUT'
    );
  }, [ account, telegram ]);

  if (name === undefined || account === undefined) return <Loading/>

  if (account === null) {
    return (
      <div css="display: flex; justify-content: center"><Account/></div>
    );
  }

  return (
    <div
      css={`
        display: flex;
      `}
    >
      <div
        css={`
          width: 40%;
        `}
      >
        <Link to="/" css="width: 60px">← atrás</Link>
      </div>
      <div
        css={`
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 50%;
        `}
      >
        <SectionTitle>
          {name}
        </SectionTitle>
        <div
          css={`
            display: flex;
            margin-bottom: 10px;
          `}
        >
          <IconBox>
            <Icon
              icon={faEthereum}
            />
          </IconBox>
          <Hash
            type="address"
            value={account}
            toolTipPosition="top"
          />
        </div>
        <div
          css={`
            display: flex;
            flex-direction: column-reverse;
          `}
        >
          <Field
            icon={faTelegram}
            value={telegram}
            register={registerTelegram}
            editing={editingTelegram}
            setEditing={setEditingTelegram}
            placeholder={firstName => `@${firstName}`}
            validator={isTelegram}
            tabIndex="2"
          />
          <Field
            icon={faAt}
            value={email}
            register={registerEmail}
            editing={editingEmail}
            setEditing={setEditingEmail}
            placeholder={firstName => `${firstName}@ejemplo.com`}
            validator={isEmail}
            tabIndex="1"
          />
        </div>
      </div>
    </div>
  );
}

const Field = ({
  icon,
  value,
  register,
  editing,
  setEditing,
  placeholder,
  validator,
  tabIndex,
}) => {
  return (
    <div
      css={`
        display: flex;
      `}
    >
      <IconBox>
        <Icon
          icon={icon}
        />
      </IconBox>
      <div>
        { editing ? (
          <Form
            icon={icon}
            current={value}
            onSubmit={register}
            onCancel={() => { setEditing(false); }}
            placeholder={placeholder}
            validator={validator}
            tabIndex={tabIndex}
          />
        ) : (
          <EditableField
            onEdit={() => { setEditing(true); }}
          >
            {value}
          </EditableField>
        )}
      </div>
    </div>
  );
}

const EditableField = ({ children, onEdit }) => {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      `}
    >
      <div>
        {children}
      </div>
      <Icon
        icon={faEdit}
        css={`
          margin-left: 10px;
          cursor: pointer;
          font-size: 12px;
        `}
        onClick={onEdit}
      />
    </div>
  );
}

const Form = ({
  icon,
  current,
  onSubmit,
  onCancel,
  placeholder,
  validator,
  tabIndex,
}) => {

  const field = createRef();
  const { name } = useContext(AccountContext);
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(false);
  const [firstName, setFirstName] = useState();
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (current) {
      setValue(current);
      setValid(true);
    }
  }, [ current ]);

  useEffect(() => {
    if (name === undefined) return;
    if (name === null) {
      setFirstName('hola');
      return;
    }
    const firstName = name.split(' ')[0].toLowerCase();
    setFirstName(firstName);
  }, [ name ]);

  useEffect(() => {
    if (!edited) {
      field.current.select();
    }
  }, [ field, edited ]);

  const setValueRaw = useCallback(({ target: { value } }) => {
    setEdited(true);
    setValue(value);
    setValid(validator(value));
  }, [ validator ]);

  const keyPressed = useCallback(({ key }) => {
    if (key === 'Enter' && valid) {
      onSubmit(value);
    } else if (key === 'Escape' && current) {
      onCancel();
    }
  }, [ valid, value ]);

  return (
    <div
      css={`
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      `}
    >
      <input
        ref={field}
        value={value}
        onChange={setValueRaw}
        onKeyUp={keyPressed}
        placeholder={ placeholder(firstName) }
        css="margin-right: 10px"
        tabIndex={tabIndex}
      />
      <Icon
        icon={faCheckCircle}
        onClick={() => { onSubmit(value) }}
        css={`
          cursor: ${valid ? 'pointer' : 'initial'};
          pointer-events: ${valid ? 'initial' : 'none'};
          color: ${valid ? 'initial' : 'gray'};
          margin-right: 10px;
        `}
      />
      { current && (
        <Icon
          icon={faTimesCircle}
          onClick={onCancel}
          css={`
            cursor: pointer;
          `}
        />
      )}
    </div>
  );
}

const IconBox = styled.div`
  width: 30px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default Profile;
