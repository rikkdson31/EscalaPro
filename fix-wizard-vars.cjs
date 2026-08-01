const fs = require('fs');

const path = 'src/pages/SetupWizard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/  const \{ saveConfig, updateProfileInfo \} = useSchedule\(\);/g, '  const { saveConfig } = useSchedule();');

fs.writeFileSync(path, content);
