/* eslint-disable id-length */
import React, { useState } from 'react';

import { ReactComponent as EditIcon } from '../../assets/edit.svg';
import { useSnap } from '../../hooks/SnapContext';
import { Button } from '../Button';
import { Loading } from '../Loading';
import { ContentText, ContentTitle } from '../styles';
import {
  ContentButtons,
  ContentErrorText,
  ContentInput,
  Edit,
  EditableInput,
  EditableInputContainer,
  Link,
} from './styles';

export const OnboardAccountWizzard = ({
  handleOnboardAccount,
}: {
  handleOnboardAccount: () => void;
}) => {
  const {
    setAESKey,
    loading,
    settingAESKeyError,
    onboardContractAddress,
    handleOnChangeContactAddress,
    handleCancelOnboard,
  } = useSnap();

  const [isEditable, setIsEditable] = useState(false);

  const handleIconClick = () => {
    setIsEditable(true);
  };

  const handleBlur = () => {
    setIsEditable(false);
  };

  const handleCancel = () => {
    handleOnboardAccount();
    handleCancelOnboard();
  };

  return loading ? (
    <Loading title="Onboard account" actionText="Onboarding account" />
  ) : (
    <>
      <ContentTitle>Onboard account</ContentTitle>
      <ContentText>
        You are going to interact with the <Link>AccountOnboard.sol</Link>{' '}
        contract.
      </ContentText>
      <ContentInput>
        <ContentText>AccountOnboard.sol address</ContentText>
        <EditableInputContainer
          $isEditable={isEditable}
          $isError={settingAESKeyError}
        >
          <EditableInput
            type="text"
            value={onboardContractAddress}
            $isEditable={isEditable}
            readOnly={!isEditable}
            onChange={(e) => handleOnChangeContactAddress(e)}
            onBlur={handleBlur}
          />
          <Edit onClick={handleIconClick}>
            <EditIcon />
          </Edit>
        </EditableInputContainer>
      </ContentInput>
      <ContentButtons>
        <Button text="Cancel" fullWith={true} onClick={handleCancel} />
        <Button primary text="Onboard" fullWith={true} onClick={setAESKey} />
      </ContentButtons>
      {settingAESKeyError && (
        <ContentErrorText>
          Error to onboard account, check the contract address
        </ContentErrorText>
      )}
    </>
  );
};
