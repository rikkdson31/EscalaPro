const fs = require('fs');

const path = 'src/components/dashboard/CycleOverviewCard.tsx';
let content = fs.readFileSync(path, 'utf8');

const newLogic = `  const todayInfo = scheduleService.getDayInfo(today);
  const isWorkDay = todayInfo.tipo === 'TRABALHO';
  
  // Find next event (next shift if today is off, next off if today is work) using central function
  const nextEventInfo = isWorkDay 
    ? scheduleService.getNextOffDay(today) 
    : scheduleService.getNextWorkDay(today);
  const nextEventDate = nextEventInfo.data;`;

content = content.replace(/  const todayInfo = scheduleService\.getDayInfo\(today\);\n  const isWorkDay = todayInfo\.tipo === 'TRABALHO';[\s\S]*?  const getDayName/g, newLogic + '\n\n  const getDayName');
fs.writeFileSync(path, content);
