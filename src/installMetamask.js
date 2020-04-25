import React from 'react';
import instructions from './assets/installMetamask.gif';

const InstallMetamask = () => {

  const reload = () => {
    window.location.reload(false);
  }
  
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
          cuando lo hayas instalado, haz clic
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
        <img src={instructions} />
      </div>
    </div>
  );
}

export default InstallMetamask;
