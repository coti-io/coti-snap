import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  width: 100%;
  margin: 16px 0;
  padding: 0 20px;
`;

const ProgressLine = styled.div`
  position: relative;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background-color: #1E29F6;
  border-radius: 2px;
  transition: width 0.3s ease;
  width: ${props => props.$progress}%;
`;

const StepsContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-top: -12px;
`;

const StepCircle = styled.div<{ $completed: boolean; $current: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${props => 
    props.$completed ? '#1E29F6' : 
    props.$current ? '#1E29F6' : '#e0e0e0'};
  color: ${props => 
    props.$completed || props.$current ? 'white' : '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  position: relative;
  z-index: 1;
  border: 2px solid ${props => 
    props.$completed ? '#1E29F6' : 
    props.$current ? '#1E29F6' : '#e0e0e0'};
`;

const StepLabel = styled.div<{ $completed: boolean; $current: boolean }>`
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: ${props => 
    props.$completed ? '#1E29F6' : 
    props.$current ? '#1E29F6' : '#666'};
  white-space: nowrap;
  font-weight: ${props => props.$current ? 'bold' : 'normal'};
`;

interface StepProgressBarProps {
  currentStep: number;
  steps: string[];
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({ 
  currentStep, 
  steps 
}) => {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <ProgressContainer>
      <ProgressLine>
        <ProgressFill $progress={Math.max(0, progress)} />
      </ProgressLine>
      <StepsContainer>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} style={{ position: 'relative' }}>
              <StepCircle 
                $completed={isCompleted} 
                $current={isCurrent}
              >
                {stepNumber}
              </StepCircle>
              <StepLabel 
                $completed={isCompleted} 
                $current={isCurrent}
              >
                {step}
              </StepLabel>
            </div>
          );
        })}
      </StepsContainer>
    </ProgressContainer>
  );
};