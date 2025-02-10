import { useState } from 'react';
import { useAccount } from 'wagmi';

import EditIcon from '../../assets/edit.svg';
import { useWrongChain } from '../../hooks';
import { useSnap } from '../../hooks/SnapContext';
import { Button } from '../Button';
import { ContentConnectYourWallet } from '../ContentConnectYourWallet';
import { ContentSwitchNetwork } from '../ContentSwitchNetwork';
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
import { COTI_FAUCET_LINK, ONBOARD_CONTRACT_LINK } from '../../config/onboard';

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

  const { isConnected } = useAccount();
  const { wrongChain } = useWrongChain();

  if (isConnected && wrongChain) {
    <ContentSwitchNetwork />;
  }

  return isConnected ? (
    loading ? (
      <Loading title="Onboard account" actionText="Onboarding account" />
    ) : (
      <>
        <ContentTitle>Onboard account</ContentTitle>
        <ContentText>
          You are about to interact with the{' '}
          <Link target="_blank" href={ONBOARD_CONTRACT_LINK}>
            AccountOnboard.sol
          </Link>{' '}
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

        {settingAESKeyError === 'accountBalanceZero' && (
          <ContentErrorText>
            Error onboarding account: Insufficient funds. Fund your account and
            try again. Testnet funds available at{' '}
            <Link target="_blank" href={COTI_FAUCET_LINK}>
              https://faucet.coti.io
            </Link>
          </ContentErrorText>
        )}
        {settingAESKeyError === 'invalidAddress' && (
          <ContentErrorText>
            Error to onboard account, check the contract address
          </ContentErrorText>
        )}
        {settingAESKeyError === 'unknownError' && (
          <ContentErrorText>
            Error to onboard account, try again
          </ContentErrorText>
        )}
      </>
    )
  ) : (
    <ContentConnectYourWallet />
  );
};
