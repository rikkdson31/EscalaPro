const fs = require('fs');
let code = fs.readFileSync('src/contexts/ScheduleContext.tsx', 'utf8');

code = code.replace(
  'saveConfig: (config: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => void;',
  'saveConfig: (config: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => UserProfile;'
);

code = code.replace(
  'const saveConfig = (newConfig: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => {',
  'const saveConfig = (newConfig: ScheduleConfig, profileUpdates?: Partial<UserProfile>): UserProfile => {'
);

const oldEnd = '    setScheduleService(new ScheduleService(newConfig));\n  };';
const newEnd = '    setScheduleService(new ScheduleService(newConfig));\n\n    return profileToSave;\n  };';

code = code.replace(oldEnd, newEnd);

fs.writeFileSync('src/contexts/ScheduleContext.tsx', code);
console.log('Patched ScheduleContext.tsx');
