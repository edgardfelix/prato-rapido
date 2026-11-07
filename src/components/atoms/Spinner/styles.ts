import styled from 'styled-components';
import { spin } from '@/styles/animations';

export const Svg = styled.svg`
  flex-shrink: 0;
  animation: ${spin} 0.8s linear infinite;
`;
