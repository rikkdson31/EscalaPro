const fs = require('fs');
let code = fs.readFileSync('src/cloud/CloudBootstrap.tsx', 'utf8');

// Replace the profiles processing logic
const newProfilesLogic = `
        if (profilesData && profilesData.length > 0) {
          // Check if schedules exist to enrich the local profile
          const { data: schedulesData } = await supabase.from('schedules').select('*').eq('user_id', userId);
          
          for (const p of profilesData) {
            const s = schedulesData?.find(sched => sched.profile_id === p.id);
            
            const localProfile: UserProfile = {
              id: p.id,
              nome: p.nome || 'Meu Perfil',
              apelido: p.apelido || '',
              matricula: p.matricula || '',
              cargo: p.cargo || '',
              foto: p.foto_url || '',
              dataCriacao: p.created_at || dateService.toISODate(dateService.now()),
              ultimaAtualizacao: p.updated_at || dateService.toISODate(dateService.now()),
              
              empresa: s?.empresa || '',
              cliente: s?.cliente || '',
              tipoEscala: s?.tipo_escala || '3x3',
              turma: s?.turma || '',
              entrada: s?.entrada || '07:00',
              saida: s?.saida || '19:00',
              dataConfiguracaoInicial: s?.reference_date || dateService.toISODate(dateService.now()),
              posicaoInicialCiclo: s?.reference_cycle_day || 0,
              temaPreferido: 'light',
              exibirMensagensAssistente: true
            };
            profileRepository.saveProfile(localProfile);
          }
          
          // Validate and enforce active profile for the current user
          const currentActiveId = settingsRepository.getActiveProfileId();
          const isValidForUser = profilesData.some(p => p.id === currentActiveId);
          
          if (!isValidForUser) {
            // Se o perfil atual não pertence ao usuário (ou se não houver perfil ativo)
            // forçamos o activeProfileId para o primeiro perfil válido deste usuário.
            settingsRepository.setActiveProfileId(profilesData[0].id);
          }
        }
`;

// Replace from 'if (profilesData && profilesData.length > 0) {' to the closing brace before 'if (isMounted) setProgress'
code = code.replace(/if \(profilesData && profilesData\.length > 0\) \{[\s\S]*?if \(!settingsRepository\.getActiveProfileId\(\)\) \{[\s\S]*?\}\s*\}/, newProfilesLogic.trim());

// Also remove diagnostic logs
code = code.replace("console.log('--- DIAGNOSTICS: CLOUD BOOTSTRAP ---');", "");
code = code.replace("console.log('1. auth.uid() [userId]:', userId);", "");
code = code.replace("console.log('2. Resultado da consulta (select * from profiles where user_id = auth.uid()):', profilesData);", "");
code = code.replace("console.log('3. Quantidade de perfis encontrados:', profilesData ? profilesData.length : 0);", "");
code = code.replace("console.log('4. Conteúdo completo do primeiro perfil encontrado:', profilesData ? profilesData[0] : null);", "");
code = code.replace("console.log('5. Resultado da gravação no ProfileRepository:', profileRepository.getAllProfiles());", "");
code = code.replace("console.log('6. storageService.getActiveProfile() imediatamente após gravação:', storageService.getActiveProfile());", "");
code = code.replace("console.log('7. Estado do perfil no final do Bootstrap profiles:', storageService.getActiveProfile());", "");

fs.writeFileSync('src/cloud/CloudBootstrap.tsx', code);
console.log('Patched CloudBootstrap.tsx');
