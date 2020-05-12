import React, { useCallback, useState } from 'react';
import Jitsi from 'react-jitsi';
import { format } from 'date-fns';
import { Loading } from './helpers';

const Meet = ({
  id,
  account,
  userName,
  attendees,
  setAttendees,
  beforeStart,
  afterEnd,
}) => {

  const [now] = useState(new Date());

  const participantChanged = useCallback((jitster, change) => {
    setAttendees(oldAttendees => {
      const attendees = [ ...oldAttendees ];
      let index = attendees.findIndex(a => a.id === jitster.id);
      if (index === -1) {
        index = attendees.findIndex(a =>
          a.name === jitster.displayName
        );
      }
      if (index === -1) {
        index = attendees.findIndex(a =>
          a.displayname === jitster.displayName
        );
      }
      if (index === -1) {
        console.error('jitster not found');
        console.error(jitster);
        console.error(attendees);
        return;
      }
      const joinedAttendee = {...attendees[index], ...jitster, ...change};
      attendees[index] = joinedAttendee;
      return attendees;
    });
  }, []);

  const handleAPI = useCallback(API => {

    API.executeCommand('subject', ' ');

    API.on('videoConferenceJoined', jitster  => {
      participantChanged(jitster, { present: true });
    });

    API.on('participantJoined', jitster => {
      participantChanged(jitster, { present: true });
    });

    API.on('dominantSpeakerChanged', jitster => {
      setAttendees(oldAttendees => {
        const attendees = [ ...oldAttendees ];
        const index = attendees.findIndex(a => a.speaker);
        if (index !== -1) {
          attendees[index].speaker = false;
        }
        return attendees;
      });
      participantChanged(jitster, { speaker: true });
    });

    API.on('displayNameChange', jitster => {
      participantChanged(jitster, {});
    });

    API.on('participantLeft', jitster => {
      participantChanged(jitster, { present: false });
    });

    API.on('videoConferenceLeft', () => {
      API.dispose();
    });

  }, []);

  if (
    userName === undefined
      || attendees === undefined
      || account === undefined
      || beforeStart === undefined
      || afterEnd === undefined
  ) return <div/>

  if (userName === null || !attendees.map(a => a.address).includes(account))
    return <div/>

  if (now < beforeStart) return (
    <div>
      {format(
        beforeStart,
        "'la videoconferencia comenzará el' dd 'de' MMMM 'de' yyyy 'a las' h:mm aa"
      )}
    </div>
  );

  if (now > afterEnd) return (
    <div>
      {format(
        afterEnd,
        "'la videoconferencia finalizó el' dd 'de' MMMM 'de' yyyy 'a las' h:mm aa"
      )}
    </div>
  );

  return (
    <Jitsi
      roomName={id}
      displayName={userName}
      userInfo={{ displayName: userName }}
      noSSL={false}
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
