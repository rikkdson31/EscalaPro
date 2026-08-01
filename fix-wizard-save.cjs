const fs = require('fs');

const path = 'src/pages/SetupWizard.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/    \/\/ Give context time to update active profile before modifying it\n    setTimeout\(\(\) => \{\n      updateProfileInfo\(\{ nome, apelido, cargo \}\);\n    \}, 50\);/g, '');

content = content.replace(/      referenceCycleDay\n    \}\);/g, `      referenceCycleDay\n    }, {\n      nome,\n      apelido,\n      cargo\n    });`);

fs.writeFileSync(path, content);
