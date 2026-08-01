import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ScheduleProvider } from './contexts/ScheduleContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthContainer } from './pages/auth/AuthContainer';
import { CloudBootstrap } from './cloud/CloudBootstrap';

function Root() {
  const { session, isOfflineMode, isBootstrapped, setBootstrapped } = useAuth();
  
  if (!session && !isOfflineMode) {
    return <AuthContainer />;
  }

  if (session && !isBootstrapped) {
    return <CloudBootstrap userId={session.user.id} onComplete={() => setBootstrapped(true)} />;
  }

  return (
    <ScheduleProvider>
      <App />
    </ScheduleProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
