import { BrowserRouter } from 'react-router';
import { HumanCheckGate } from '@/components/modals/HumanChallenge';
import { AppShell } from '@/components/templates/AppShell';
import { AppProviders } from '@/context/AppProviders';
import { AccessGate } from '@/routes/AccessGate';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppShell>
          {/* Paid access first ("Ative seu Acesso"), then "Verificação rápida", then the app. */}
          <AccessGate>
            <HumanCheckGate>
              <AppRoutes />
            </HumanCheckGate>
          </AccessGate>
        </AppShell>
      </AppProviders>
    </BrowserRouter>
  );
}
