import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Web3Context, AccountContext, BackendContext } from './coinosis';
import { ASSESSMENT } from './event';
import {
  Amount,
  formatDate,
  Link,
  Loading,
  SectionTitle,
  usePost,
} from './helpers';
import Account from './account';

// taken from https://stackoverflow.com/a/48161723/2430274
const sha256 = (message, callback) => {
  const msgBuffer = new TextEncoder('utf-8').encode(message);
  crypto.subtle.digest('SHA-256', msgBuffer).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    callback(hashHex);
  });
}

const Attendance = ({
  eventName,
  event,
  fee,
  organizer,
  attendees,
  beforeStart,
  afterEnd,
}) => {

  const web3 = useContext(Web3Context);
  const { account, name: user } = useContext(AccountContext);
  const backendURL = useContext(BackendContext);
  const post = usePost();
  const [feeUSDWei, setFeeUSDWei] = useState();
  const [now] = useState(new Date());
  const [paymentList, setPaymentList] = useState();
  const [referenceCode, setReferenceCode] = useState();
  const [formWindow, setFormWindow] = useState();

  const fetchPayments = useCallback(() => {
    fetch(`${backendURL}/payu/${event}/${account}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        } else {
          return response.json();
        }
      }).then(data => {
        setPaymentList(data);
       }).catch(err => {
        console.error(err);
       });
  }, [ backendURL, event, account ]);

  useEffect(() => {
    if (referenceCode && formWindow && paymentList.length) {
      for (let i = 0; i < paymentList.length; i++) {
        const payment = paymentList[i];
        if (
          payment.referenceCode === referenceCode
            && payment.pull.status.indexOf('PENDING') === -1
        ) {
          formWindow.close();
          setFormWindow();
          setReferenceCode();
          return;
        }
      }
    }
  }, [paymentList, referenceCode, formWindow]);

  useEffect(() => {
    if (!backendURL || !event || !account) return;
    fetchPayments();
    const paymentsFetcher = setInterval(fetchPayments, 10000);
    return () => {
      clearInterval(paymentsFetcher);
    };
  }, [ backendURL, event, account ]);

  useEffect(() => {
    if (!fee) return;
    const feeUSDWei = web3.utils.toWei(String(fee));
    setFeeUSDWei(feeUSDWei);
  }, [fee]);

  const formSubmit = useCallback((url, object) => {
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', url);
    for (const key in object) {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', key);
      input.setAttribute('value', object[key]);
      form.appendChild(input);
    }
    const formWindow = window.open('', 'formWindow', 'width=1000,height=800');
    formWindow.document.body.appendChild(form);
    formWindow.document.forms[0].submit();
    setFormWindow(formWindow);
  }, [formWindow, setFormWindow]);

  const attend = useCallback(() => {
    const url = 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/';
    const counter = paymentList.length + 1;
    const referenceCode = `${event}:${account}:${counter}`;
    setReferenceCode(referenceCode);
    const object = {
      merchantId: 508029,
      referenceCode,
      description: eventName,
      amount: fee,
      tax: 0,
      taxReturnBase: 0,
      accountId: 512321,
      currency: 'USD',
      buyerFullName: user,
      buyerEmail: '',
      algorithmSignature: 'SHA256',
      confirmationUrl: `https://coinosis-test.herokuapp.com/payu`,
      test: 1,
    };
    const apiKey = '4Vj8eK4rloUd272L48hsrarnUA'; // this is a test apiKey. Real one can't go to source control
    const payload = `${apiKey}~${object.merchantId}~${object.referenceCode}`
    + `~${object.amount}~${object.currency}`;
    sha256(payload, signature => {
      object.signature = signature;
      formSubmit(url, object);
    });
  }, [eventName, event, fee, account, user, paymentList]);

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

  if (user === undefined) return <Loading/>

  if (user === null) {
    return <Account/>
  }

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
              margin: 0 5px 10px;
            `}
        >
          <Amount usd={feeUSDWei} />
        </div>
      </div>
      { attendees.map(a => a.address).includes(account) ? (
        <div
          css={`
            display: flex;
            flex-direction: column;
            align-items: center;
          `}
        >
        <SectionTitle>
          te inscribiste exitosamente
        </SectionTitle>
          {now >= beforeStart && now <= afterEnd && (
            <div>
              dirígete a
              <Link to={`${ASSESSMENT}`}>{ASSESSMENT}</Link>
              para participar.
            </div>
          )}
        </div>
      ) : (
        <div>
          <div>
            <button
              onClick={attend}
              disabled={paymentList === undefined}
            >
              inscríbete
            </button>
          </div>
        </div>
      )}
      { !!paymentList && !!paymentList.length && (
        <div>
          <table
            css={`
                border-collapse: collapse;
                td {
                  border: 1px solid black;
                  padding: 10px;
                };
              `}
          >
            <caption>
              <SectionTitle>
                historial de transacciones
              </SectionTitle>
            </caption>
            <thead>
              <tr>
                <th>fecha</th>
                <th>monto</th>
                <th>resultado</th>
                <th>referencia</th>
              </tr>
            </thead>
            <tbody>
              { paymentList.map(payment => {
                const { pull, push } = payment;
                return (
                  <tr key={payment.referenceCode}>
                    <td>{formatDate(new Date(pull.requestDate))}</td>
                    <td>{pull.value} {pull.currency}</td>
                    <td>{pull.status}</td>
                    <td>{payment.referenceCode}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Attendance;
