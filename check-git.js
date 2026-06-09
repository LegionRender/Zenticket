import { execSync } from 'child_process';
import fs from 'fs';

console.log("=== CHECKING GIT CONFIG ===");
try {
  if (fs.existsSync('.git/config')) {
    console.log(".git/config exists. Contents:\n", fs.readFileSync('.git/config', 'utf8'));
  } else {
    console.log(".git/config does NOT exist");
  }
} catch (e) {
  console.error("Error reading config:", e);
}

try {
  const remotes = execSync('git remote -v', { encoding: 'utf8' });
  console.log("Remotes:\n", remotes);
} catch (e) {
  console.error("Error getting remotes:", e.message);
}
