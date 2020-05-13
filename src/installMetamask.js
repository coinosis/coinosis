import React, { useCallback, useEffect, useState } from 'react';
import { Loading } from './helpers';
import installBraveWallet from './assets/installBraveWallet.png';
import installMetamask from './assets/installMetamask.gif';

const InstallMetamask = () => {

  const [brave, setBrave] = useState();

  const reload = useCallback(() => {
    window.location.reload(false);
  }, [ window.location ]);

  useEffect(() => {
    if (navigator.brave) {
      setBrave(true);
    } else {
      setBrave(false);
    }
  }, [ navigator.brave ]);

  if (brave === undefined) return <Loading/>
  
  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: arial;
        font-size: 24px;
      `}
    >
      <div
        css={`
          font-size: 34px;          
        `}
      >
        te damos la bienvenida a coinosis
      </div>
      <div
        css={`
          display: flex;
        `}
      >
        <div
          css={`
            margin-right: 5px;
          `}
        >
          para continuar, necesitas instalar
        </div>
        <div>
          { brave ? (
            <span>
              tu billetera de Brave
            </span>
          ) : (
            <a
              target="_blank"
              href="https://metamask.io/"
              css={`
                color: black;
                &:visited {
                  color: black;
                };
              `}
            >
              metamask
            </a>
          )}
        </div>
      </div>
      <div
        css={`
          display: flex;
        `}
      >
        <div
          css={`
            margin-right: 5px;
          `}
        >
          cuando lo hayas hecho, haz clic
        </div>
        <div
          onClick={reload}
          css={`
            text-decoration: underline;
            cursor: pointer;
          `}
        >
          aquí
        </div>
      </div>
      <div
        css={`
          margin-top: 50px;
        `}
      >
        { brave ? (
          <ol>
            <li>Escribe <i>brave://wallet</i> en la barra de direcciones</li>
            <li>
              En la sección <i>New Local Wallet</i>, selecciona <i>Create</i>
            </li>
            <li>
              Sigue las instrucciones
            </li>
            <img src={installBraveWallet} />
          </ol>
        ) : (
          <img src={installMetamask} />
        )}
      </div>
    </div>
  );
}

export default InstallMetamask;
