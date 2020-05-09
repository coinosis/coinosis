import React, { useCallback } from 'react';
import Jitsi from 'react-jitsi';
import { Loading } from './helpers';

const Meet = ({ id, userName }) => {

  const handleAPI = useCallback(API => {
    API.executeCommand('subject', ' ');
    API.on('participantJoined', obj => {
      console.log(obj);
    });
    API.on('displayNameChange', obj => {
      console.log(obj);
    });
    API.on('dominantSpeakerChanged', obj => {
      console.log(obj);
    });
    API.on('participantLeft', obj => {
      console.log(obj);
    });
    API.getDisplayName('aou');
  }, []);

  if (userName === undefined) return <div/>

  return (
    <Jitsi
      roomName={id}
      displayName={userName}
      loadingComponent={Loading}
      onAPILoad={handleAPI}
      containerStyle={{ width: '100%', height: '800px' }}
      config={{
        startWithAudioMuted: true,
        fileRecordingsEnabled: false,
        remoteVideoMenu: {
          disableKick: true,
        },
      }}
      interfaceConfig={{
        DEFAULT_BACKGROUND: '#476047',
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'desktop',
          'chat',
          'livestreaming',
          'raisehand',
          'videoquality',
          'stats',
          'shortcuts',
          'tileview',
          'mute-everyone',
          'settings',
        ],
        SETTINGS_SECTIONS: ['language'],
        SHOW_CHROME_EXTENSION_BANNER: false,
        ENFORCE_NOTIFICATION_AUTO_DISMISS_TIMEOUT: 15000,
      }}
    />
  );
}

export default Meet
