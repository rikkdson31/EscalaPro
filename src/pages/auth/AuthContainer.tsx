import React, { useState } from 'react';
import { supabase } from '../../cloud/SupabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

export function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setOfflineMode } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        console.log('1. email enviado:', email);
        const response = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome }
          }
        });
        console.log('2. resposta completa:', response);
        console.log('3. data:', response.data);
        console.log('4. error:', response.error);
        console.log('5. status:', response?.error?.status || (response as any).status);
        const { error } = response;
        if (error) throw error;
        // Optionally switch to login or notify user to check email
        alert('Cadastro realizado! Se o e-mail não exigir confirmação, você já está logado.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Preencha o e-mail para recuperar a senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('E-mail de recuperação enviado!');
    } catch (err: any) {
      setError(err.message || 'Erro ao tentar recuperar a senha.');
    } finally {
      setLoading(false);
    }
  };

    const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
  const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      <div className="bg-yellow-100 p-2 text-xs text-yellow-800 font-mono text-center border-b border-yellow-200 z-50 shrink-0">
        <div>SUPABASE_URL: {supabaseUrl || 'undefined'}</div>
        <div>SUPABASE_KEY_INICIO: {supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined'}</div>
        <div>URL_VALIDA: {supabaseUrl === 'https://placeholder.supabase.co' || !supabaseUrl ? 'PLACEHOLDER' : 'REAL'}</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">EscalaPro</h1>
          <p className="text-slate-500 mt-2">
            {isLogin ? 'Faça login para sincronizar seus dados' : 'Crie sua conta para backup na nuvem'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-10 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="Seu nome"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors block w-full"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors block w-full"
            >
              Esqueci minha senha
            </button>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">ou</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOfflineMode(true)}
            className="w-full bg-slate-100 text-slate-700 p-3 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Continuar sem conta (Apenas Local)
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
}
