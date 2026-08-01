const fs = require('fs');

const path = 'src/contexts/AuthContext.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add isBootstrapped to context interface
code = code.replace(
  "interface AuthContextType {",
  "interface AuthContextType {\n  isBootstrapped: boolean;\n  setBootstrapped: (val: boolean) => void;"
);
code = code.replace(
  "const AuthContext = createContext<AuthContextType>({",
  "const AuthContext = createContext<AuthContextType>({\n  isBootstrapped: false,\n  setBootstrapped: () => {},"
);

const newUseAuth = `
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isOfflineMode, setOfflineMode] = useState<boolean>(
    localStorage.getItem('escalaPro_offlineMode') === 'true'
  );
  const [loading, setLoading] = useState(true);
  const [isBootstrapped, setIsBootstrapped] = useState<boolean>(
    localStorage.getItem('escalaPro_bootstrapped') === 'true'
  );

  const setBootstrapped = (val: boolean) => {
    setIsBootstrapped(val);
    localStorage.setItem('escalaPro_bootstrapped', val.toString());
  };
`;

code = code.replace(/export function AuthProvider\(\{ children \}: \{ children: React\.ReactNode \}\) \{[\s\S]*?const \[loading, setLoading\] = useState\(true\);/, newUseAuth.trim());

const newUseEffect = `
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session) {
        setOfflineMode(false);
        cloudSyncEngine.start();
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session) {
        setOfflineMode(false);
        cloudSyncEngine.start();
      } else {
        cloudSyncEngine.stop();
        setBootstrapped(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
`;

code = code.replace(/useEffect\(\(\) => \{[\s\S]*?return \(\) => subscription\.unsubscribe\(\);\s*\}, \[\]\);/, newUseEffect.trim());

code = code.replace(/const checkAndCreateProfile = async \(user: User\) => \{[\s\S]*?catch \(err\) \{\s*console\.error\('Error checking profile', err\);\s*\}\s*\};/, "");

code = code.replace(/value=\{\{ session, user, isOfflineMode, setOfflineMode, signOut \}\}/, "value={{ session, user, isOfflineMode, setOfflineMode, signOut, isBootstrapped, setBootstrapped }}");

fs.writeFileSync(path, code);
console.log('Fixed AuthContext.tsx');
