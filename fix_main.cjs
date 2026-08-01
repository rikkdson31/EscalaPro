const fs = require('fs');
const path = 'src/main.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("import { AuthContainer } from './pages/auth/AuthContainer';", "import { AuthContainer } from './pages/auth/AuthContainer';\nimport { CloudBootstrap } from './cloud/CloudBootstrap';");

const newRoot = `
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
`;

code = code.replace(/function Root\(\) \{[\s\S]*?return \([\s\S]*?\);\s*\}/, newRoot.trim());

fs.writeFileSync(path, code);
console.log('Fixed main.tsx');
