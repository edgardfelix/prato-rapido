import styled from 'styled-components';

export const Photo = styled.img`
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  object-fit: cover;
  background: ${({ theme }) => theme.colors.surfaceRaised};
`;

export const IconCircle = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  color: var(--avatar-color);
  background: color-mix(in srgb, var(--avatar-color) 18%, transparent);
`;

export const Initials = styled.span`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.full};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.display};
  font-weight: ${({ theme }) => theme.fontWeights.extrabold};
  line-height: 1;
`;
