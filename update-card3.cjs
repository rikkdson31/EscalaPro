const fs = require('fs');

const path = 'src/components/dashboard/CycleSummaryCard.tsx';
let content = fs.readFileSync(path, 'utf8');

const newLogic = `  const todayInfo = scheduleService.getDayInfo(todayDate);
  const isWorkDay = todayInfo.tipo === 'TRABALHO';
  
  // Quick forward calculation to find days until change using central function
  const remainingDays = isWorkDay 
    ? scheduleService.getDaysUntilNextOff(todayDate) - 1
    : scheduleService.getDaysUntilNextWork(todayDate) - 1;`;

content = content.replace(/  const todayInfo = scheduleService\.getDayInfo\(todayDate\);\n  const isWorkDay = todayInfo\.tipo === 'TRABALHO';[\s\S]*?  return \(/g, newLogic + '\n\n  return (');
fs.writeFileSync(path, content);
