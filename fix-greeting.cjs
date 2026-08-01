const fs = require('fs');

const path = 'src/components/dashboard/DashboardGreeting.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const name = activeProfile\?\.nome\.split\(' '\)\[0\] \|\| 'Usuário';/, "const name = activeProfile?.apelido || activeProfile?.nome.split(' ')[0] || 'Usuário';");
fs.writeFileSync(path, content);
