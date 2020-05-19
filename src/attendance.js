import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Web3Context, AccountContext, BackendContext } from './coinosis';
import { ASSESSMENT } from './event';
import Amount from './amount';
import {
  environment,
  formatDate,
  Link,
  Loading,
  SectionTitle,
  usePost,
} from './helpers';
import settings from './settings.json';
import Account from './account';

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
  const [approved, setApproved] = useState();
  const [pending, setPending] = useState();

  const fetchPayments = useCallback(() => {
    fetch(`${backendURL}/payu/${event}/${account}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        } else {
          return response.json();
        }
      }).then(data => {
        setApproved(data.some(d => d.pull.status === 'APPROVED'));
        setPending(data.some(d => d.pull.status === 'PENDING'));
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
            && payment.pull.status !== 'PENDING'
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
    const payUGateway = settings[environment].payU.gateway;
    const counter = paymentList.length + 1;
    const referenceCode = `${event}:${account}:${counter}`;
    setReferenceCode(referenceCode);
    const test = environment === 'production' ? 0 : 1;
    const object = {
      merchantId: settings[environment].payU.merchantId,
      referenceCode,
      description: eventName,
      amount: fee,
      tax: 0,
      taxReturnBase: 0,
      accountId: settings[environment].payU.accountId,
      currency: 'USD',
      buyerFullName: user,
      buyerEmail: '',
      algorithmSignature: 'SHA256',
      confirmationUrl: `${backendURL}/payu`,
      test,
    };
    fetch(
      `${backendURL}/payu/hash`,
      {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: object.merchantId,
          referenceCode: object.referenceCode,
          amount: object.amount,
          currency: object.currency,
        }),
      }
    ).then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(hash => {
      object.signature = hash;
      formSubmit(payUGateway, object);
    }).catch(err => {
      console.error(err);
    });
  }, [eventName, event, fee, account, user, paymentList, backendURL]);

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
      ) : paymentList === undefined ? (
        <Loading/>
      ) : (
        <div
          css={`
            display: flex;
            flex-direction: column;
            align-items: center;
          `}
        >
          { !paymentList.length ? (
            <button
              onClick={attend}
            >
              inscríbete
            </button>
          ) : approved ? (
            <div>
              <SectionTitle>
                tu pago fue aceptado
              </SectionTitle>
              <div>
                esperando confirmación por parte de PayU...
              </div>
            </div>
          ) : pending ? (
            <div
              css={`
                display: flex;
                flex-direction: column;
                align-items: center;
              `}
            >
              <SectionTitle>
                tu pago está pendiente
              </SectionTitle>
              <button onClick={attend}>
                usa otro medio de pago
              </button>
            </div>
          ) : (
            <div
              css={`
                display: flex;
                flex-direction: column;
                align-items: center;
              `}
            >
              <SectionTitle>
                tu pago fue rechazado
              </SectionTitle>
              <button
                onClick={attend}
              >
                intenta de nuevo
              </button>
            </div>
          )}
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
                    <td>{pull.response}</td>
                    <td>
                      { pull.receipt ? (
                        <a
                          onClick={() => window.open(
                            pull.receipt,
                            'receiptWindow',
                            'width=1000,height=800'
                          )}
                          css={`
                            text-decoration: underline;
                            cursor: pointer;
                          `}
                        >
                          {payment.referenceCode}
                        </a>
                      ) : (
                        <div>{payment.referenceCode}</div>
                      ) }
                    </td>
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
