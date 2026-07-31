export type AssistantMessageCategory = 
  | 'primeiro_dia_trabalho'
  | 'segundo_dia_trabalho'
  | 'terceiro_dia_trabalho'
  | 'primeiro_dia_folga'
  | 'segundo_dia_folga'
  | 'terceiro_dia_folga'
  | 'ultimo_turno_antes_folga'
  | 'vespera_retorno_trabalho';

export interface AssistantMessage {
  id: string;
  categoria: AssistantMessageCategory;
  titulo: string;
  texto: string;
  emoji: string;
  assinatura: string;
  prioridade?: number;
  tags?: string[];
}

const assinaturas = [
  '— EscalaPro: Seu Assistente de Jornada 💙',
  '— Conte com o EscalaPro.',
  '— Acompanhando sua rotina.',
  '— Seu assistente pessoal.',
  '— Inteligência na sua escala.',
];

function gerarMensagensFolgas(): AssistantMessage[] {
  const mensagens: AssistantMessage[] = [];
  const temas = [
    'Aproveite cada momento deste merecido descanso. Lembre-se, o EscalaPro já atualizou seu calendário.',
    'Sua folga chegou! Aproveite para relaxar.',
    'O trabalho espera, agora é o seu momento de paz. Sua jornada já está sincronizada.',
    'Respire fundo, sua folga começou.',
    'Um merecido descanso para quem dá o seu melhor. Acompanhamos seus dias por você.',
    'Aproveite os próximos dias para cuidar de você.',
    'Sua folga, suas regras. Se houver alguma mudança, basta registrar no menu de Ocorrências.',
    'Relaxe, você fez um ótimo trabalho. Seu ciclo já está planejado.'
  ];
  
  const emojis = ['🏖️', '🌴', '☀️', '🌅', '🍃', '😎', '✨', '💙'];
  
  for (let i = 0; i < 30; i++) {
    mensagens.push({
      id: `folga_${i}`,
      categoria: 'primeiro_dia_folga',
      titulo: 'Boas Folgas!',
      texto: temas[i % temas.length],
      emoji: emojis[i % emojis.length],
      assinatura: assinaturas[i % assinaturas.length],
      prioridade: 1,
      tags: ['folga', 'descanso', 'assistente'],
    });
  }
  return mensagens;
}

function gerarMensagensTrabalho(): AssistantMessage[] {
  const mensagens: AssistantMessage[] = [];
  const temas = [
    'Bom retorno! Sua escala já está carregada. Lembre-se: só informe no app se houver alguma ocorrência (ex: hora extra, falta).',
    'Vamos com tudo! Não é necessário registrar ponto diário aqui, apenas ocorrências atípicas.',
    'Foco e segurança. O EscalaPro acompanha seu ciclo automaticamente.',
    'Que sua jornada seja leve. Se precisar de ajustes (como trocas de turno), avise no Centro de Ocorrências.',
    'Iniciando mais um ciclo. Seu assistente pessoal da jornada já configurou seus próximos turnos.',
    'Seu trabalho faz a diferença. Trabalhe tranquilo, nós organizamos o seu calendário.',
    'Segurança em primeiro lugar, sempre. Qualquer imprevisto, registre facilmente conosco.',
    'Desejamos um turno tranquilo e produtivo. Só interaja com o app se precisar reportar algo.'
  ];
  
  const emojis = ['👷', '🦺', '⚙️', '🚜', '💪', '⭐', '🛡️', '🎯'];
  
  for (let i = 0; i < 30; i++) {
    mensagens.push({
      id: `trabalho_${i}`,
      categoria: 'primeiro_dia_trabalho',
      titulo: 'Bom Trabalho!',
      texto: temas[i % temas.length],
      emoji: emojis[i % emojis.length],
      assinatura: assinaturas[i % assinaturas.length],
      prioridade: 1,
      tags: ['trabalho', 'assistente', 'dica'],
    });
  }
  return mensagens;
}

export const assistantMessages: AssistantMessage[] = [
  ...gerarMensagensFolgas(),
  ...gerarMensagensTrabalho(),
];
