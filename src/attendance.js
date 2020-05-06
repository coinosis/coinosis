import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { AccountContext } from './coinosis';
import { environment, EtherscanLink, Loading, usePost } from './helpers';
import Account from './account';

const Attendance = () => {

  const { account, setAccount, name, setName } = useContext(AccountContext);
  const [unsavedName, setUnsavedName] = useState('');
  const [message, setMessage] = useState('');
  const nameInput = createRef();
  const post = usePost();

  useEffect(() => {
    if (nameInput.current) {
      nameInput.current.focus();
    }
  }, [nameInput]);

  const attend = useCallback(() => {
    const object = {
      address: account,
      name: unsavedName
    };
    post('users', object, (error, data) => {
      if (error) {
        if (error.toString().includes('400')) {
          setMessage('ese nombre ya existe en nuestra base de datos');
        }
        return;
      }
      setName(data.name);
    });
  }, [account, unsavedName]);

  useEffect(() => {
    if (message) setMessage('');
  }, [unsavedName]);

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
            nombre y apellido:
          </div>
          <div
            css={`
              margin: 0 5px;
            `}
          >
            <input
              ref={nameInput}
              value={unsavedName}
              onChange={e => setUnsavedName(e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={attend}
              disabled={unsavedName === ''}
            >
              asistiré
            </button>
          </div>
        </div>
        <div>
          <div>
            {message}
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
        gracias por registrarte,
      </div>
      <div
        css={`
          margin: 0 5px;
        `}
      >
        <EtherscanLink type="address" value={account}>
          {name}
        </EtherscanLink>
      </div>
      <div>
        !
      </div>
    </div>
  );
}

export default Attendance;
