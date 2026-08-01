const fs = require('fs');
let code = fs.readFileSync('src/cloud/InitialSync.ts', 'utf8');

const regex = /export async function performInitialCloudUpload\(userId: string, profile: UserProfile, config: ScheduleConfig\) \{\s*console\.log\('1\. A função performInitialCloudUpload\(\) foi chamada\? SIM'\);\s*console\.log\('userId recebido:', userId\);\s*try \{\s*await uploadInitialProfile\(userId, profile\);\s*await uploadInitialSchedule\(userId, profile\.id, config\);\s*await uploadInitialSettings\(userId, profile\.id\);\s*\/\/ After finishing, ensure the sync engine is started\s*cloudSyncEngine\.start\(\);\s*\} catch \(err\) \{\s*console\.error\('Exception in performInitialCloudUpload:', err\);\s*\}\s*\}/s;

const replace = `export async function performInitialCloudUpload(userId: string, profile: UserProfile, config: ScheduleConfig) {
  await uploadInitialProfile(userId, profile);
  await uploadInitialSchedule(userId, profile.id, config);
  await uploadInitialSettings(userId, profile.id);
  
  // After finishing, ensure the sync engine is started
  cloudSyncEngine.start();
}`;

if (regex.test(code)) {
  code = code.replace(regex, replace);
  fs.writeFileSync('src/cloud/InitialSync.ts', code);
  console.log('Patched performInitialCloudUpload');
} else {
  console.log('Could not find performInitialCloudUpload using regex');
}
