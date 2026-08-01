const fs = require('fs');
let code = fs.readFileSync('src/cloud/InitialSync.ts', 'utf8');

const regexes = [
  {
    table: 'profiles',
    search: /const response = await supabase\.from\('profiles'\)\.upsert\(payload\);\s*console\.log\('5\. Depois do upsert - profiles:'\);\s*console\.log\('data:', response\.data\);\s*console\.log\('error:', response\.error\);\s*console\.log\('status:', response\.status\);\s*console\.log\('statusText:', response\.statusText\);\s*if \(response\.error\) \{\s*console\.error\('Error uploading profile:', response\.error\);\s*\}/,
    replace: `const { data, error, status, statusText } = await supabase.from('profiles').upsert(payload).select();
    
    console.log('5. Depois do upsert - profiles:');
    console.log(data);
    console.log(error);
    console.log(status);
    console.log(statusText);
    
    if (error) {
      console.error('Error uploading profile:', error);
    }`
  },
  {
    table: 'schedules',
    search: /const response = await supabase\.from\('schedules'\)\.upsert\(payload\);\s*console\.log\('5\. Depois do upsert - schedules:'\);\s*console\.log\('data:', response\.data\);\s*console\.log\('error:', response\.error\);\s*console\.log\('status:', response\.status\);\s*console\.log\('statusText:', response\.statusText\);\s*if \(response\.error\) \{\s*console\.error\('Error uploading schedule:', response\.error\);\s*\}/,
    replace: `const { data, error, status, statusText } = await supabase.from('schedules').upsert(payload).select();
    
    console.log('5. Depois do upsert - schedules:');
    console.log(data);
    console.log(error);
    console.log(status);
    console.log(statusText);
    
    if (error) {
      console.error('Error uploading schedule:', error);
    }`
  },
  {
    table: 'settings',
    search: /const response = await supabase\.from\('settings'\)\.upsert\(payload\);\s*console\.log\('5\. Depois do upsert - settings:'\);\s*console\.log\('data:', response\.data\);\s*console\.log\('error:', response\.error\);\s*console\.log\('status:', response\.status\);\s*console\.log\('statusText:', response\.statusText\);\s*if \(response\.error\) \{\s*console\.error\('Error uploading settings:', response\.error\);\s*\}/,
    replace: `const { data, error, status, statusText } = await supabase.from('settings').upsert(payload).select();
    
    console.log('5. Depois do upsert - settings:');
    console.log(data);
    console.log(error);
    console.log(status);
    console.log(statusText);
    
    if (error) {
      console.error('Error uploading settings:', error);
    }`
  }
];

regexes.forEach(({ search, replace }) => {
  code = code.replace(search, replace);
});

fs.writeFileSync('src/cloud/InitialSync.ts', code);
console.log('Patched InitialSync.ts');
