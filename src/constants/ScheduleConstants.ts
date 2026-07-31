export const ScheduleConstants = {
  // Configured defaults
  DEFAULT_ESCALA: '3x3',
  DEFAULT_ENTRADA: '07:00',
  DEFAULT_SAIDA: '19:00',
  
  // Future scales preparation
  ESCALA_TYPES: {
    THREE_X_THREE: '3x3',
    FIVE_X_TWO: '5x2',
    TWELVE_X_THIRTY_SIX: '12x36',
    CUSTOM: 'custom'
  }
} as const;
