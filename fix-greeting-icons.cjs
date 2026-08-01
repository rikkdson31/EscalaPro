const fs = require('fs');
const path = 'src/components/dashboard/DashboardGreeting.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the array-based alternation check with the engine's property
content = content.replace(
  /const isTypeChange = i > 0 && nextDays\[i - 1\]\.tipo !== day\.tipo;/g,
  'const isTypeChange = i > 0 && day.posicaoCiclo === 1;'
);

fs.writeFileSync(path, content);
