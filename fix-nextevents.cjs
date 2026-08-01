const fs = require('fs');

const path = 'src/components/dashboard/NextEventsCard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/  let nextWork: DayInfo \| null = null;\n  let nextOff: DayInfo \| null = null;\n  let cycleChange: DayInfo \| null = null;\n  /g, '');
fs.writeFileSync(path, content);
