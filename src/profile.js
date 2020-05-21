import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import {
  faAt,
  faCheckCircle,
  faEdit,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { AccountContext } from './coinosis';
import { Hash, Loading, SectionTitle, usePost } from './helpers';
import { isEmail } from './common';
import Account from './account';

const Profile = () => {

  const post = usePost();
  const { name, account, email: savedEmail } = useContext(AccountContext);
  const [email, setEmail] = useState();
  const [editingEmail, setEditingEmail] = useState();

  useEffect(() => {
    if (savedEmail === undefined) return;
    setEmail(savedEmail);
    setEditingEmail(savedEmail === null);
  }, [savedEmail]);

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
      },
      'PUT'
    );
  }, [ account, email ]);

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
        flex-direction: column;
        align-items: center;
      `}
    >
      <SectionTitle>
        {name}
      </SectionTitle>
      <div
        css={`
          display: flex;
          margin-bottom: 20px;
        `}
      >
        <Hash
          type="address"
          value={account}
          toolTipPosition="top"
        />
      </div>
      <div
        css={`
          display: flex;
          align-items: center;
        `}
      >

        { editingEmail ? (
          <EmailForm
            email={email}
            onSubmit={registerEmail}
            onCancel={() => { setEditingEmail(false); }}
          />
        ) : (
          <EditableField
            onEdit={() => { setEditingEmail(true); }}
          >
            {email}
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

const EmailForm = ({ email: current, onSubmit, onCancel }) => {

  const field = createRef();
  const { account, name } = useContext(AccountContext);
  const [email, setEmail] = useState('');
  const [valid, setValid] = useState(false);
  const [firstName, setFirstName] = useState();
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (current) {
      setEmail(current);
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

  const setEmailRaw = useCallback(({ target: { value } }) => {
    setEdited(true);
    setEmail(value);
    setValid(isEmail(value));
  }, []);

  const keyPressed = useCallback(({ key }) => {
    if (key === 'Enter' && valid) {
      onSubmit(email);
    } else if (key === 'Escape') {
      onCancel();
    }
  }, [ valid, email ]);

  return (
    <div
      css={`
        display: flex;
        align-items: center;
      `}
    >
      <Icon
        icon={faAt}
        css={`
          margin-right: 10px;
        `}
      />
      <input
        ref={field}
        value={email}
        onChange={setEmailRaw}
        onKeyUp={keyPressed}
        placeholder={ `${firstName}@ejemplo.com` }
        css="margin-right: 10px"
      />
      <Icon
        icon={faCheckCircle}
        onClick={() => { onSubmit(email) }}
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

export default Profile;
