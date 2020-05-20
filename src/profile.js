import React, { useContext } from 'react';
import { AccountContext } from './coinosis';
import { SectionTitle } from './helpers';

const Profile = () => {

  const { name } = useContext(AccountContext);

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
    </div>
  );
}

export default Profile;
