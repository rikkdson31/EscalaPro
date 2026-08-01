import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../cloud/SupabaseClient';
import { cloudSyncEngine } from '../cloud/CloudSyncEngine';
import { storageService } from '../services/StorageService';
import { settingsRepository } from '../repositories/SettingsRepository';
import { dateService } from '../services/DateService';
import { UserProfile } from '../types';

interface AuthContextType {
  isBootstrapped: boolean;
  setBootstrapped: (val: boolean) => void;
  session: Session | null;
  user: User | null;
  isOfflineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isBootstrapped: false,
  setBootstrapped: () => {},
  session: null,
  user: null,
  isOfflineMode: false,
  setOfflineMode: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

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
        settingsRepository.setActiveProfileId('');
        setBootstrapped(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  

  const signOut = async () => {
    await supabase.auth.signOut();
    settingsRepository.setActiveProfileId(''); // Clear active profile
    setBootstrapped(false);
  };

  useEffect(() => {
    localStorage.setItem('escalaPro_offlineMode', isOfflineMode.toString());
  }, [isOfflineMode]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ session, user, isOfflineMode, setOfflineMode, signOut, isBootstrapped, setBootstrapped }}>
      {children}
    </AuthContext.Provider>
  );
}
