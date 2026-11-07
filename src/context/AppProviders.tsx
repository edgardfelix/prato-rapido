import type { PropsWithChildren } from 'react';
import { AccessProvider } from './AccessProvider';
import { CelebrationProvider } from './CelebrationProvider';
import { HumanCheckProvider } from './HumanCheckProvider';
import { JourneyProvider } from './JourneyProvider';
import { RecipeProvider } from './RecipeProvider';
import { SoundProvider } from './SoundProvider';
import { ThemeModeProvider } from './ThemeModeProvider';
import { ToastProvider } from './ToastProvider';
import { UserProvider } from './UserProvider';

/**
 * Global state composition root:
 * theme → sound → paid access → human check → user (profile, avatar, AI
 * context) → recipes → celebrations → toasts → journey.
 * `useUserProfile()` reads the user and journey layers through a single hook.
 */
export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeModeProvider>
      <SoundProvider>
        <AccessProvider>
          <HumanCheckProvider>
            <UserProvider>
              <RecipeProvider>
                <CelebrationProvider>
                  <ToastProvider>
                    <JourneyProvider>{children}</JourneyProvider>
                  </ToastProvider>
                </CelebrationProvider>
              </RecipeProvider>
            </UserProvider>
          </HumanCheckProvider>
        </AccessProvider>
      </SoundProvider>
    </ThemeModeProvider>
  );
}
