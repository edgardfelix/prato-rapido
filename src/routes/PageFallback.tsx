import styled from 'styled-components';
import { Spinner } from '@/components/atoms/Spinner';

const Wrapper = styled.div`
  display: grid;
  flex: 1;
  place-items: center;
  min-height: 60vh;
  color: ${({ theme }) => theme.colors.primary};
`;

/** Shown for the few milliseconds a lazy route chunk takes to load. */
export function PageFallback() {
  return (
    <Wrapper>
      <Spinner size={28} label="Carregando" />
    </Wrapper>
  );
}
