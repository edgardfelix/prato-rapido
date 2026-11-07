import 'styled-components';
import type { AppTheme } from '@/styles/theme';

declare module 'styled-components' {
  // Augments the theme used by every styled component with our design tokens.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
