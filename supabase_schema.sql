-- =====================================================================================
-- ESCALAPRO - SUPABASE POSTGRESQL SCHEMA (OFFLINE-FIRST ARCHITECTURE)
-- =====================================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- TABELAS
-- =====================================================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    apelido TEXT,
    matricula TEXT,
    cargo TEXT,
    foto_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Armazena os múltiplos perfis de um usuário autênticado.';

-- 2. SCHEDULES
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    empresa TEXT NOT NULL,
    cliente TEXT NOT NULL,
    tipo_escala TEXT NOT NULL,
    turma TEXT NOT NULL,
    entrada TEXT NOT NULL,
    saida TEXT NOT NULL,
    reference_date DATE NOT NULL,
    reference_cycle_day INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.schedules IS 'Configurações de jornada e regras da escala.';

-- 3. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, config_key)
);
COMMENT ON TABLE public.settings IS 'Configurações avulsas, preferências de UI e metadados flexíveis.';

-- 4. TIME_RECORDS
CREATE TABLE IF NOT EXISTS public.time_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    observations TEXT,
    entries JSONB NOT NULL DEFAULT '[]'::jsonb,
    justificativa JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(profile_id, date)
);
COMMENT ON TABLE public.time_records IS 'Registros diários agregados com marcações e anexos aninhados via JSONB.';

-- 5. PENDING_ITEMS
CREATE TABLE IF NOT EXISTS public.pending_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    time_record_id UUID REFERENCES public.time_records(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    notes TEXT,
    resolved_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.pending_items IS 'Alertas, anomalias e tarefas pendentes.';

-- 6. OCCURRENCES
CREATE TABLE IF NOT EXISTS public.occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    motivo TEXT NOT NULL,
    anexos JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.occurrences IS 'Registros de eventos anômalos prolongados (férias, licenças).';

-- 7. ACTIVITY_LOG (TIMELINE)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.activity_log IS 'Log de auditoria (append-only) alimentando a timeline do usuário.';

-- 8. DEVICES
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.devices IS 'Registro de dispositivos para auxiliar no Sync Engine e resolução de conflitos.';

-- =====================================================================================
-- COMENTÁRIOS SOBRE STORAGE (BACKUPS)
-- =====================================================================================
-- A entidade `backups` NÃO EXISTE como tabela relacional transacional.
-- O versionamento e integridade dos backups (ZIP/JSON) são mantidos EXCLUSIVAMENTE
-- pelas abstrações e metadados do SUPABASE STORAGE (Bucket: "backups").
-- =====================================================================================

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- POLICIES (Usuário só acessa e altera seus próprios dados)

CREATE POLICY "Users can access their own profiles" ON public.profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own schedules" ON public.schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own settings" ON public.settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own time records" ON public.time_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own pending items" ON public.pending_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own occurrences" ON public.occurrences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own activity logs" ON public.activity_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access their own devices" ON public.devices FOR ALL USING (auth.uid() = user_id);

-- =====================================================================================
-- ÍNDICES DE PERFORMANCE
-- =====================================================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_schedules_profile_id ON public.schedules(profile_id);
CREATE INDEX idx_time_records_profile_date ON public.time_records(profile_id, date);
CREATE INDEX idx_pending_items_profile_status ON public.pending_items(profile_id, status);
CREATE INDEX idx_pending_items_profile_priority ON public.pending_items(profile_id, priority);
CREATE INDEX idx_occurrences_profile_id ON public.occurrences(profile_id);
CREATE INDEX idx_activity_log_profile_created ON public.activity_log(profile_id, created_at DESC);

