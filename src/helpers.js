import React from 'react';

export const Loading = () => {
  return <div>por favor espera...</div>
}

const ToolTip = ({ value, show }) => {
  return (
    <div css="position: relative">
      <div
        css={`
          display: ${show ? 'block' : 'none'};
          position: absolute;
          bottom: 7px;
          background: black;
          color: #f0f0f0;
          padding: 5px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: normal;
        `}
      >
        {value}
      </div>
    </div>
  );
}

const Hash = ({ type, value }) => {

  const [short, setShort] = useState();
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    const length = value.length;
    const short = value.substring(0, 6) + '...' + value.substring(length - 4);
    setShort(short);
  }, [value]);

  return (
    <div>
      <ToolTip value={value} show={showFull} />
      <Link
        type={type}
        value={value}
        onMouseOver={() => setShowFull(true)}
        onMouseOut={() => setShowFull(false)}
      >
        {short}
      </Link>
    </div>
  );
}

const Link = ({ type, value, internal=false, children, ...props }) => {

  const [href, setHref] = useState('');

  useEffect(() => {
    let href = `https://etherscan.io/${type}/${value}`;
    if (internal) {
      href += '#internal';
      if (type === 'address') {
        href += 'tx';
      }
    }
    setHref(href);
  }, [value]);

  return (
    <a
      href={href}
      target="_blank"
      {...props}
      css={`
        color: black;
        &:visited {
          color: black;
        }
      `}
    >
      {children}
    </a>
  );
}
