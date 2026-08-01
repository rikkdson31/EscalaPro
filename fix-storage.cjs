const fs = require('fs');
const path = 'src/repositories/providers/LocalStorageProvider.ts';
let content = fs.readFileSync(path, 'utf8');

// Fix get
content = content.replace(
  /      return JSON\.parse\(item\) as T;\n    \} catch \(e\) \{/,
  `      try {
        return JSON.parse(item) as T;
      } catch (e) {
        return item as unknown as T;
      }
    } catch (e) {`
);

// Fix set
content = content.replace(
  /const toSave = typeof value === 'string' \? value : JSON\.stringify\(value\);/,
  `const toSave = JSON.stringify(value);`
);

fs.writeFileSync(path, content);
