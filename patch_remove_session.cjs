const fs = require('fs');
let code = fs.readFileSync('src/cloud/InitialSync.ts', 'utf8');

const regex = /export async function performInitialCloudUpload\([\s\S]*?cloudSyncEngine\.start\(\);\s*\} catch \(err\) \{/m;

const replace = `export async function performInitialCloudUpload(userId: string, profile: UserProfile, config: ScheduleConfig) {
  console.log('1. A função performInitialCloudUpload() foi chamada? SIM');
  console.log('userId recebido:', userId);
  
  try {
    await uploadInitialProfile(userId, profile);
    await uploadInitialSchedule(userId, profile.id, config);
    await uploadInitialSettings(userId, profile.id);
    
    // After finishing, ensure the sync engine is started
    cloudSyncEngine.start();
  } catch (err) {`;

code = code.replace(regex, replace);

fs.writeFileSync('src/cloud/InitialSync.ts', code);
console.log('Patched InitialSync.ts');
