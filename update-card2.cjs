const fs = require('fs');

const path = 'src/components/dashboard/NextEventsCard.tsx';
let content = fs.readFileSync(path, 'utf8');

const newLogic = `  const todayInfo = scheduleService.getDayInfo(todayDate);
  const isWorkToday = todayInfo.tipo === 'TRABALHO';
  
  // Uses central function, avoiding loops
  const nextWork = scheduleService.getNextWorkDay(todayDate);
  const nextOff = scheduleService.getNextOffDay(todayDate);
  const cycleChange = isWorkToday ? nextOff : nextWork;`;

content = content.replace(/  const todayInfo = scheduleService\.getDayInfo\(todayDate\);\n  const isWorkToday = todayInfo\.tipo === 'TRABALHO';[\s\S]*?  const formatShort/g, newLogic + '\n\n  const formatShort');
fs.writeFileSync(path, content);
