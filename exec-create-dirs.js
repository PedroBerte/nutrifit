const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, 'backend-node');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd: backendDir, stdio: 'inherit', shell: true });
}

try {
  console.log('=== NutriFit Node backend setup ===\n');
  
  run('node init-structure.js');
  run('node setup-add-modules.js');
  run('npm install');
  run('npx prisma generate');

  console.log('\n=== Setup complete! ===');
  console.log('Next: npx prisma migrate dev --name init && npx prisma db seed');
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
