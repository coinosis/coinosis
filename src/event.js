import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { BackendContext } from './coinosis';
import Registration from './registration';
import Assessment from './assessment';
import Result from './result';

export const REGISTRATION = Symbol('REGISTRATION');
const ASSESSMENT = Symbol('ASSESSMENT');
const RESULT = Symbol('RESULT');

const Event = () => {

  const { eventURL } = useParams();
  const backendURL = useContext(BackendContext);
  const [name, setName] = useState();
  const [selectedTab, setSelectedTab] = useState(REGISTRATION);
  const [ActiveElement, setActiveElement] = useState(() => Registration);
  const [assessmentSent, setAssessmentSent] = useState();

  useEffect(() => {
    if (backendURL === null) {
      setSelectedTab(RESULT);
    }
  }, [backendURL]);

  useEffect(() => {
    fetch(`${backendURL}/event/${eventURL}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.json();
      }).then(({ name }) => {
        setName(name);
      }).catch(err => {
        console.error(err);
      });
  }, [backendURL, eventURL]);

  useEffect(() => {
    if (selectedTab === REGISTRATION) {
      setActiveElement(() => Registration);
    }
    else if (selectedTab === ASSESSMENT) {
      setActiveElement(() => Assessment);
    }
    else if (selectedTab === RESULT) {
      setActiveElement(() => Result);
    }
  }, [selectedTab]);

  return (
    <div>
      <Title text={name} />
      <Tabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
      <ActiveElement
        setSelectedTab={setSelectedTab}
        sent={assessmentSent}
        setSent={setAssessmentSent}
      />
    </div>
  );

}

const Title = ({ text }) => {
  return (
    <div
      css={`
        display: flex;
        justify-content: center;
        margin: 40px;
        font-size: 32px;
      `}
    >
      {text}
    </div>
  );
}

const Tabs = ({ selectedTab, setSelectedTab }) => {

  const backendURL = useContext(BackendContext);

  return (
    <div
      css={`
        display: flex;
        justify-content: center;
        margin-bottom: 50px;
      `}
    >
      <Tab
        id={REGISTRATION}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        disabled={backendURL === null}
      />
      <Tab
        id={ASSESSMENT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        disabled={backendURL === null}
      />
      <Tab
        id={RESULT}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />
    </div>
  );
}

const Tab = ({ id, selectedTab, setSelectedTab, disabled=false }) => {

  const [name, setName] = useState('');
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const name = id === REGISTRATION ?
          'registro' :
          id === ASSESSMENT ?
          'aplausos' :
          id === RESULT ?
          'resultados' :
          '';
    setName(name);
    setIsSelected(id === selectedTab);
  }, [selectedTab]);

  const select = useCallback(() => {
    if (disabled) return;
    setSelectedTab(id);
  }, [disabled]);

  return (
    <StyledTab
      isSelected={isSelected}
      onClick={select}
      disabled={disabled}
    >
      {name}
    </StyledTab>
  );

}

const StyledTab = styled.div`
  padding: 10px;
  background: ${({ isSelected }) => isSelected ? '#e0e0e0' : '#f8f8f8'};
  border: 1px solid #e0e0e0;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  color: ${({ disabled }) => disabled ? '#505050' : 'black'};
`

export default Event;
