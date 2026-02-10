import { Suspense, memo } from 'react';
import styled from 'styled-components';

import { Loading } from '../Loading';

const WrapperContainer = styled.div`
  min-height: 400px;
  transition: all 200ms ease-out;

  &.content-loading {
    opacity: 0.8;
  }
`;

type ContentWrapperProps = {
  children: React.ReactNode;
  isLoading?: boolean;
};

export const ContentWrapper = memo(
  ({ children, isLoading = false }: ContentWrapperProps) => {
    return (
      <WrapperContainer className={isLoading ? 'content-loading' : ''}>
        <Suspense fallback={<Loading title="Loading..." actionText="" />}>
          {children}
        </Suspense>
      </WrapperContainer>
    );
  },
);

ContentWrapper.displayName = 'ContentWrapper';
