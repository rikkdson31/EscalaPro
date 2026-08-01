# RELATÓRIO ARQUITETURAL E MODELAGEM DE DADOS DEFINITIVA – ESCALAPRO

Após uma auditoria completa na estrutura atual do EscalaPro (tipos, repositórios, IndexedDB, fallback para LocalStorage, FutureSyncQueue, BackupService, entre outros), elaboramos este relatório arquitetural visando a adoção do Supabase (PostgreSQL) sob uma arquitetura estrita de Offline-First.

---

## PARTE 1: AUDITORIA DA ARQUITETURA ATUAL

### 1. Todas as entidades encontradas
- **UserProfile** (representando Perfil do Usuário)
- **ScheduleConfig** (representando Configurações da Escala)
- **Settings** (Configurações avulsas, metadados do Assistente, ID do perfil ativo)
- **TimeRecord** (Registro Diário de Ponto)
- **TimeEntry** (Marcação individual de ponto – aninhada em TimeRecord)
- **TimeRecordJustification** (Justificativa de Ponto – aninhada em TimeRecord)
- **TimeEntryAttachment** (Anexo de ponto/justificativa – aninhado)
- **PendingItem** (Pendências / Alertas gerados pelo sistema)
- **SyncEvent** (Eventos na FutureSyncQueue)
- **BackupData** (Estrutura monolítica atual de Backup)
- **Occurrences / TimelineEvents** (Mencionados no serviço de backup, previstos arquiteturalmente mas sem tipagem estrita atual)

### 2. Todos os campos existentes
- **UserProfile**: `id`, `nome`, `empresa`, `cliente`, `tipoEscala`, `turma`, `entrada`, `saida`, `dataConfiguracaoInicial`, `posicaoInicialCiclo`, `temaPreferido`, `exibirMensagensAssistente`, `dataCriacao`, `ultimaAtualizacao`, `apelido`, `matricula`, `cargo`, `foto`.
- **ScheduleConfig**: `empresa`, `cliente`, `tipoEscala`, `turma`, `entrada`, `saida`, `referenceDate`, `referenceCycleDay`, `exibirMensagensAssistente`.
- **TimeRecord**: `id`, `profileId`, `date`, `status`, `createdAt`, `updatedAt`, `observations`, `entries`, `justificativa`.
- **TimeEntry**: `id`, `tipo`, `horario`, `origem`, `observacao`, `anexos`.
- **TimeRecordJustification**: `id`, `motivo`, `detalhes`, `anexos`, `protocoloEmpresa`, `responsavelAprovacao`, `dataSolicitacao`, `status`.
- **PendingItem**: `id`, `profileId`, `timeRecordId`, `createdAt`, `updatedAt`, `status`, `priority`, `type`, `title`, `description`, `recommendation`, `dueDate`, `resolvedAt`, `resolvedBy`, `notes`.
- **SyncEvent**: `id`, `entityName`, `operation`, `entityId`, `payload`, `timestamp`.

### 3. Relacionamentos entre entidades
- Um **UserProfile** possui uma (ou mais, futuramente) **ScheduleConfig** (1:1 ou 1:N).
- Um **UserProfile** possui muitos **TimeRecord** (1:N).
- Um **UserProfile** possui muitos **PendingItem** (1:N).
- Um **TimeRecord** possui muitos **PendingItem** associados (1:N).

### 4. Chaves primárias
- Deverão ser tratadas nos campos `id` das tabelas raiz (profiles, time_records, pending_items).
- O campo `id` local atualmente é um alfanumérico aleatório, mas para o Supabase precisaremos mapear para UUID.

### 5. Chaves estrangeiras
- `profileId` (em TimeRecord e PendingItem) referenciando `profiles.id`.
- `timeRecordId` (em PendingItem) referenciando `time_records.id`.
- Em tabelas restritas por usuário, precisaremos de um `user_id` (Supabase Auth) referenciando `auth.users`.

### 6. Índices recomendados
- `user_id` em quase todas as tabelas (essencial para as políticas RLS).
- `profile_id` nas tabelas operacionais (`time_records`, `pending_items`).
- `date` em `time_records` (filtros mensais e diários rápidos).
- `status` e `type` em `pending_items` (para obter rapidamente pendências não resolvidas).

### 7. Campos que deveriam utilizar UUID
- Todos os `id` (ex: `UserProfile.id`, `TimeRecord.id`, `PendingItem.id`).
- Todas as chaves estrangeiras (`profileId`, `timeRecordId`).
- `user_id` de autenticação.

### 8. Campos que deveriam utilizar TIMESTAMP WITH TIME ZONE
- `dataCriacao`, `ultimaAtualizacao`, `createdAt`, `updatedAt`, `resolvedAt`, `dueDate`, `timestamp` (da SyncQueue).
- As `date` puras (`YYYY-MM-DD`) de referência (ex: dia do registro de ponto) podem ser `DATE`.

### 9. Campos que deveriam utilizar JSONB
- **Settings**: Para flexibilidade das configurações do assistente (stats, favorites, configs diversas).
- **TimeRecord.entries**: Em uma arquitetura Offline-First, sincronizar um agregado (TimeRecord com suas Entries e Justificativas embutidas) como um único JSONB evita complexidade massiva de sincronização transacional entre tabelas dependentes.
- **TimeRecord.justificativa**: Mesmo motivo, aninhar na raiz do record via JSONB.
- **SyncEvent.payload**: Para armazenar as mutações genéricas da fila.

### 10. Campos opcionais
- `apelido`, `matricula`, `cargo`, `foto` em UserProfile.
- `observations`, `justificativa` em TimeRecord.
- `dueDate`, `resolvedAt`, `resolvedBy`, `notes` em PendingItem.

### 11. Campos obrigatórios
- `id`, `user_id`, datas de criação/atualização.
- Relacionamentos pais (ex: `profileId`).

### 12. Campos calculados
- `healthImpact`, `progress`, estado de workflow (devem ser computados no cliente, não salvos fixos no banco para evitar anomalias, ou podem ser *Generated Columns* se necessário na nuvem para BI, mas preferencialmente calculados no frontend).

### 13. Campos que não deveriam existir
- Campos de controle puramente locais que não precisam ir pra nuvem (ex: chaves temporárias do assistente se forem apenas de sessão, ou `activeProfileId` se o controle de aba/ativo for restrito ao aparelho atual).

### 14. Duplicações encontradas
- **CRÍTICA:** A configuração de escala (`empresa`, `cliente`, `tipoEscala`, `turma`, `entrada`, `saida`, `referenceDate`, `referenceCycleDay`) existe TANTO em `UserProfile` QUANTO em `ScheduleConfig`. 
- **Consequência:** Risco de dessincronização entre as duas entidades.

### 15. Problemas de normalização
- A duplicação citada acima entre Profile e Schedule. Deve ser resolvida transferindo a configuração de escala unicamente para `schedules` e referenciando no Profile, ou mantendo unificada no Profile se houver garantia de apenas 1 escala ativa por perfil.
- Anexos e Entradas de ponto aninhados como arrays (desnormalizado). **Porém**, para o padrão Offline-First, essa desnormalização (usando JSONB) é na verdade uma **vantagem tática**, pois garante atomicidade na sincronização de um registro diário.

### 16. Problemas de escalabilidade
- Se separássemos `entries` e `attachments` em tabelas relacionais puras, cada salvamento offline no cliente exigiria uma orquestração de várias promises locais e múltiplas SyncQueues com resolução de FKs em cadeia. Escalar isso para 100.000 usuários com conectividade instável causaria deadlocks na sincronização. O modelo baseado em Documento/JSONB para sub-entidades (dentro do `time_records`) é altamente escalável.

### 17. Problemas para sincronização
- **IDs gerados localmente:** Se o cliente gera IDs que não são UUIDv4 puros, poderá haver colisão.
- **Ausência de Timestamp Real:** Dispositivos com relógio atrasado podem enviar eventos com `timestamp` inválido ou gerar sobrescritas (Last Write Wins) equivocadas.

### 18. Problemas para múltiplos dispositivos
- Dois dispositivos do mesmo usuário editando o *mesmo dia* simultaneamente sem conectividade. O *Last Write Wins* simples anulará o trabalho de um deles. Em dados aninhados (JSONB), a perda pode ser maior. 

### 19. Problemas para login
- Sem suporte para amarração de `user_id` em todos os repositórios atuais. Os dados locais estão "órfãos" do ponto de vista de Cloud. Ao fazer login, precisaremos injetar o `user_id` em toda a massa local antes de dar push.

### 20-23. Problemas Backup/Restore/Offline/Futuro
- A estrutura de backup atual engole a base inteira num monolito `APP_STORAGE_V2`. Escalar para anos de uso resultará em um JSON monstruoso e lento, além de crashar a memória em dispositivos fracos. Na arquitetura Supabase, o backup "manual" pode apenas exportar as tabelas remotas de forma paginada ou utilizar pg_dump.


---

## PARTE 2: PROPOSTA DE BANCO DE DADOS DEFINITIVA (SUPABASE)

As tabelas a seguir contemplam o projeto arquitetural exigido. Toda tabela terá:
- `user_id` (UUID referenciando `auth.users`, exceto quando for do próprio schema auth).
- RLS habilitado, garantindo que `auth.uid() = user_id`.

### 1. `users` (auth.users do Supabase)
- **Finalidade:** Gerenciamento nativo de identidade (e-mail, provedores externos).
- **Estratégia:** Mantida integralmente pela plataforma Supabase.

### 2. `profiles`
- **Finalidade:** Metadados do usuário e múltiplos perfis (ex: um perfil CLT, outro PJ).
- **Campos:** `id` (UUID PK), `user_id` (UUID FK auth.users), `nome` (Text), `apelido` (Text), `matricula` (Text), `cargo` (Text), `foto_url` (Text), `created_at` (Timestamptz), `updated_at` (Timestamptz).
- **Estratégia de Sincronização:** Last Write Wins baseado no `updated_at`.
- **Estratégia de Backup:** Exportado junto com dados gerais; fotos armazenadas no Storage e URLs persistidas aqui.

### 3. `schedules`
- **Finalidade:** Configuração das regras da escala, desvinculada para permitir histórico de mudanças sem alterar o perfil.
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `profile_id` (UUID FK profiles.id), `empresa` (Text), `cliente` (Text), `tipo_escala` (Text), `turma` (Text), `entrada` (Text), `saida` (Text), `reference_date` (Date), `reference_cycle_day` (Int), `created_at`, `updated_at`.
- **Estratégia de Sincronização:** Last Write Wins.

### 4. `settings`
- **Finalidade:** Armazenar configurações de uso, assistente virtual e preferências de UI do perfil.
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `profile_id` (UUID FK), `config_key` (Text - ex: "assistant", "ui_theme"), `config_value` (JSONB), `updated_at` (Timestamptz).
- **Estratégia de Sincronização:** Resolução por `config_key`. Atualizações mesclam as keys independentemente.

### 5. `time_records`
- **Finalidade:** Armazenar a agregação atômica de um dia de trabalho.
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `profile_id` (UUID FK), `date` (Date), `status` (Text), `observations` (Text), `entries` (JSONB - *Contém as marcações com seus horários, origem e links de anexos*), `justificativa` (JSONB - *Contém o fluxo de justificativa*), `created_at`, `updated_at`.
- **Índices:** `(user_id, profile_id, date)`.
- **Estratégia de Sincronização:** Last Write Wins a nível do dia. Se a granularidade for um problema para múltiplos dispositivos, o merge deve ser feito via cliente comparando o tamanho dos arrays em `entries` (CRDTs simplificados).
- **RLS:** Acesso restrito via `user_id = auth.uid()`.

### 6. `pending_items`
- **Finalidade:** Alertas, anomalias ou tarefas pendentes (ex: esqueceu de bater o ponto).
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `profile_id` (UUID FK), `time_record_id` (UUID FK time_records.id nullable), `type` (Text), `status` (Text), `priority` (Text), `title` (Text), `description` (Text), `recommendation` (Text), `resolved_at` (Timestamptz nullable), `notes` (Text), `created_at`, `updated_at`.
- **Índices:** `(user_id, profile_id, status)`.
- **Estratégia de Sincronização:** Last Write Wins com `updated_at`.

### 7. `occurrences`
- **Finalidade:** Registro de ocorrências gerais que não são do dia a dia da escala padrão (ex: Atestados Médicos, Férias, Licenças).
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `profile_id` (UUID FK), `tipo` (Text), `data_inicio` (Date), `data_fim` (Date), `motivo` (Text), `anexos` (JSONB), `created_at`, `updated_at`.

### 8. `timeline_events`
- **Finalidade:** Histórico em formato de feed/timeline (para auditoria do usuário).
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `profile_id` (UUID FK), `event_type` (Text), `event_data` (JSONB), `created_at` (Timestamptz).
- **Estratégia de Sincronização:** Append-only (Apenas inclusão). Sem updates concorrentes, minimizando conflitos.

### 9. `backups`
- **Finalidade:** Metadados dos backups gerados e armazenados no Supabase Storage.
- **Campos:** `id` (UUID PK), `user_id` (UUID FK), `file_path` (Text - ref bucket `backups`), `version` (Text), `size_bytes` (Int), `checksum` (Text), `created_at` (Timestamptz).
- **RLS:** Somente inserção/leitura do próprio usuário.
- **Storage Strategy:** O arquivo real de backup fica no bucket, essa tabela apenas mapeia os backups para a UI.

### 10. `sync_queue` (Dead Letter / Audit de Sincronização - Opcional no Servidor)
- **Finalidade:** Fila de sincronização do lado da nuvem para auditoria de mutações e resolução de conflitos, se necessário.
- **Campos:** `id`, `user_id`, `entity`, `operation`, `payload` (JSONB), `error_log`, `created_at`.
- **Recomendação:** A fila real deve permanecer no IndexedDB local, evitando uso de banco na nuvem apenas para gerenciar filas ativas, exceto logs de erro (Dead Letter Queue).

### 11. `migrations`
- **Finalidade:** Registrar execuções de DDL e atualizações estruturais de schema. Gerenciado nativamente pela CLI do Supabase.

---

## PARECER E CONCLUSÃO ARQUITETURAL

1. A duplicidade entre `UserProfile` e `ScheduleConfig` deve ser endereçada futuramente de maneira cuidadosa (removendo a duplicação ou mantendo como dados legados, dependendo de compatibilidade).
2. A utilização do `JSONB` para `entries` de `time_records` é a **decisão arquitetural mais forte** na camada de sincronização, pois encapsula a complexidade relacional atômica do dia de trabalho em um documento fácil de se fazer `upsert` Offline-First.
3. Os IDs no front-end precisam ser convertidos de IDs randômicos alfanuméricos atuais para `UUIDv4` para respeitar o padrão global do Postgres, ou então as chaves primárias remotas deverão ser do tipo `VARCHAR` na migração (o que pode comprometer indexação em larga escala).
