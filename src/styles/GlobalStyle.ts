import { createGlobalStyle } from 'styled-components';
import { palettes, paletteToCssVariables, type ThemeMode } from './theme';

interface GlobalStyleProps {
  $mode: ThemeMode;
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  :root {
    ${({ $mode }) => paletteToCssVariables(palettes[$mode])}
    color-scheme: ${({ $mode }) => $mode};
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    background: ${({ theme }) => theme.colors.background};
  }

  body {
    min-height: 100vh;
    min-height: 100dvh;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: ${({ theme }) => theme.lineHeights.normal};
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.background};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    text-rendering: optimizeLegibility;
  }

  @media (min-width: 521px) {
    html,
    body {
      background: ${({ theme }) => theme.colors.backdrop};
    }
  }

  #root {
    isolation: isolate;
  }

  img,
  picture,
  svg,
  video,
  canvas {
    display: block;
    max-width: 100%;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }

  button {
    cursor: pointer;
    background: none;
    border: 0;
    padding: 0;
    touch-action: manipulation;
  }

  button:disabled {
    cursor: not-allowed;
  }

  a {
    color: inherit;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: ${({ theme }) => theme.fonts.display};
    line-height: ${({ theme }) => theme.lineHeights.tight};
    letter-spacing: -0.02em;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  ul,
  ol {
    padding: 0;
    list-style: none;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }

  [tabindex='-1']:focus {
    outline: none;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primarySoft};
  }

  /* Cross-fade used by the theme toggle (View Transitions API). */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 280ms;
    animation-timing-function: ${({ theme }) => theme.motion.easeOut};
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
