import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  NavLink,
  Switch,
  Route,
  Redirect,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { AccountContext, BackendContext } from './coinosis';
import { Link, Loading } from './helpers';
import Attendance from './attendance';
import Meet from './meet';
import Assessment from './assessment';
import Result from './result';

export const ATTENDANCE = 'asistencia';
const ASSESSMENT = 'aplausos';
const RESULT = 'resultados';

const Event = () => {

  const { eventURL } = useParams();
  const { account, name: userName } = useContext(AccountContext);
  const backendURL = useContext(BackendContext);
  const [name, setName] = useState();
  const [url, setUrl] = useState();
  const [id, setId] = useState();
  const [fee, setFee] = useState();
  const [organizer, setOrganizer] = useState();
  const [attendees, setAttendees] = useState();
  const [assessmentSent, setAssessmentSent] = useState();
  const match = useRouteMatch();

  useEffect(() => {
    fetch(`${backendURL}/event/${eventURL}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      }).then(({ _id, name, url, fee, organizer, attendees }) => {
        setId(_id);
        setName(name);
        setUrl(url);
        setFee(fee);
        setOrganizer(organizer);
        setAttendees(attendees);
      }).catch(err => {
        console.error(err);
      });
  }, [backendURL, eventURL]);

  if (attendees === undefined) return <Loading/>

  return (
    <div>
      <Title text={name} />
      <Tabs/>
      <Switch>
        <Route path={`${match.path}/${ATTENDANCE}`}>
          <Attendance
            url={url}
            fee={fee}
            organizer={organizer}
            attendees={attendees}
            setAttendees={setAttendees}
          />
        </Route>
        <Route path={`${match.path}/${ASSESSMENT}`}>
          <div
            css={`
              display: flex;
            `}
          >
            <Assessment
              sent={assessmentSent}
              setSent={setAssessmentSent}
              url={url}
              attendees={attendees}
            />
            <Meet id={id} userName={userName} />
          </div>
        </Route>
        <Route path={`${match.path}/${RESULT}`}>
          <Result url={url} />
        </Route>
        <Route path={match.path}>
          <Redirect to={`${match.url}/${ATTENDANCE}`} />
        </Route>
      </Switch>
    </div>
  );
}

const Title = ({ text }) => {
  return (
    <div
      css={`
        display: flex;
      `}
    >
      <Link to="/" css={'width: 60px'}>← atrás</Link>
      <div
        css={`
          display: flex;
          justify-content: center;
          margin: 40px;
          font-size: 32px;
          flex-grow: 1;
        `}
      >
        {text}
      </div>
      <div css={'width: 60px'}/>
    </div>
  );
}

const Tabs = () => {
  return (
    <div
      css={`
        display: flex;
        justify-content: center;
        margin-bottom: 50px;
      `}
    >
      <Tab name={ATTENDANCE} />
      <Tab name={ASSESSMENT} />
      <Tab name={RESULT} />
    </div>
  );
}

const Tab = ({ name }) => {

  const match = useRouteMatch();
  const backendURL = useContext(BackendContext);

  return (
    <StyledTab
      to={`${match.url}/${name}`}
      activeClassName="selected"
      disabled={backendURL === null}
    >
      {name}
    </StyledTab>
  );
}

export const StyledTab = styled(NavLink)`
  padding: 10px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  color: ${({ disabled }) => disabled ? '#505050' : 'black'};
  text-decoration: none;
  &.selected {
    background: #e0e0e0;
  }
`

export default Event;
