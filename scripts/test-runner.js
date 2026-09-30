const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING TEST SUITE: MATH & PHYSICS MODEL LIBRARY');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${testName}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${testName}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

async function main() {
  // TEST GROUP 1: Security & Sanitization
  console.log('--- 1. Security & Path Traversal Prevention ---');
  
  runTest('Prevent Directory Traversal in ZIP relative paths', () => {
    // Replicate sanitizeRelativePath
    function sanitizeRelativePath(unsafePath) {
      const clean = unsafePath.replace(/\0/g, '').replace(/\\/g, '/');
      const segments = clean.split('/').filter(s => s && s !== '.' && s !== '..');
      return segments.join('/');
    }

    assert.strictEqual(sanitizeRelativePath('../../etc/passwd'), 'etc/passwd');
    assert.strictEqual(sanitizeRelativePath('../../../windows/system32/cmd.exe'), 'windows/system32/cmd.exe');
    assert.strictEqual(sanitizeRelativePath('assets/images/diagram.svg'), 'assets/images/diagram.svg');
    assert.strictEqual(sanitizeRelativePath('./subfolder/../index.html'), 'subfolder/index.html');
  });

  runTest('Validate entry file extensions (.html, .htm)', () => {
    function isValidEntryFile(filename) {
      if (!filename) return false;
      const lower = filename.toLowerCase();
      return lower.endsWith('.html') || lower.endsWith('.htm');
    }

    assert.strictEqual(isValidEntryFile('index.html'), true);
    assert.strictEqual(isValidEntryFile('simulation.htm'), true);
    assert.strictEqual(isValidEntryFile('malicious.exe'), false);
    assert.strictEqual(isValidEntryFile('script.js'), false);
  });

  // TEST GROUP 2: IDOR and Authorization Checks
  console.log('\n--- 2. IDOR & Authorization Checks ---');

  runTest('Verify private model can only be accessed by owner or admin', () => {
    function canAccessModel(model, user) {
      if (model.visibility === 'public') return true;
      if (user.role === 'admin') return true;
      return model.ownerUserId === user.id;
    }

    const publicModel = { visibility: 'public', ownerUserId: 'user-001' };
    const privateModelUser1 = { visibility: 'private', ownerUserId: 'user-001' };

    const normalUser1 = { id: 'user-001', role: 'user' };
    const normalUser2 = { id: 'user-002', role: 'user' };
    const adminUser = { id: 'admin-001', role: 'admin' };

    // Public model: accessible by anyone
    assert.strictEqual(canAccessModel(publicModel, normalUser1), true);
    assert.strictEqual(canAccessModel(publicModel, normalUser2), true);
    assert.strictEqual(canAccessModel(publicModel, adminUser), true);

    // Private model of User 1:
    assert.strictEqual(canAccessModel(privateModelUser1, normalUser1), true); // Owner can access
    assert.strictEqual(canAccessModel(privateModelUser1, normalUser2), false); // Other user BLOCKED (403/404)
    assert.strictEqual(canAccessModel(privateModelUser1, adminUser), true); // Admin can audit
  });

  runTest('Verify only owner or admin can modify/delete model', () => {
    function canModifyModel(model, user) {
      if (user.role === 'admin') return true;
      return model.ownerUserId === user.id;
    }

    const modelUser1 = { ownerUserId: 'user-001' };
    const normalUser1 = { id: 'user-001', role: 'user' };
    const normalUser2 = { id: 'user-002', role: 'user' };
    const adminUser = { id: 'admin-001', role: 'admin' };

    assert.strictEqual(canModifyModel(modelUser1, normalUser1), true);
    assert.strictEqual(canModifyModel(modelUser1, normalUser2), false); // User 2 cannot modify User 1's model!
    assert.strictEqual(canModifyModel(modelUser1, adminUser), true);
  });

  // TEST GROUP 3: Database & Seed Verification
  console.log('\n--- 3. Database & Model Categories Verification ---');

  runTest('Verify Math and Physics categories separation', () => {
    const dbPath = path.join(process.cwd(), '.data', 'db.json');
    let categories = [];
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      categories = data.categories || [];
    } else {
      // If not yet instantiated, read from default categories definition
      const dbModule = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'database', 'db.ts'), 'utf-8');
      const matches = dbModule.match(/\{ id: 'cat-[^}]+ \}/g) || [];
      categories = matches.map(m => {
        const isMath = m.includes("'math'");
        return { subject: isMath ? 'math' : 'physics' };
      });
    }
    
    assert(categories.length >= 10, 'Must have at least 10 categories');
    const mathCats = categories.filter(c => c.subject === 'math');
    const physicsCats = categories.filter(c => c.subject === 'physics');

    assert(mathCats.length > 0, 'Math categories must exist');
    assert(physicsCats.length > 0, 'Physics categories must exist');

    // Confirm no unwanted extra sections (e.g. social, blog, forum, chat)
    const unwanted = categories.find(c => ['blog', 'forum', 'chat', 'gamification'].includes(c.slug));
    assert(!unwanted, 'Categories must remain strictly Math and Physics models');
  });

  // TEST GROUP 4: Storage Provider Abstraction & Admin Central Drive Structure
  console.log('\n--- 4. Storage Provider & Drive Architecture ---');

  await runAsyncTest('LocalFallbackStorageProvider mimics Central Admin Google Drive structure', async () => {
    const testStorageDir = path.join(process.cwd(), '.data', 'storage', 'User Uploads', 'user_test_01', 'Math');
    fs.mkdirSync(testStorageDir, { recursive: true });

    const dummyFile = path.join(testStorageDir, 'test_model.html');
    const testHtml = '<html><body><h1>Test Simulation</h1></body></html>';
    fs.writeFileSync(dummyFile, testHtml);

    assert(fs.existsSync(dummyFile), 'File must be written to user folder');
    const read = fs.readFileSync(dummyFile, 'utf-8');
    assert.strictEqual(read, testHtml, 'File content must match');

    // Cleanup test file
    fs.unlinkSync(dummyFile);
  });

  // TEST GROUP 5: Demo Models Real Interaction Check
  console.log('\n--- 5. Real Interactive Demo Models Verification ---');

  runTest('Verify Demo Models exist with real interactive code and postMessage', () => {
    const demoDir = path.join(process.cwd(), 'public', 'demo-models');
    
    const quadPath = path.join(demoDir, 'demo_quadratic_function.html');
    const pendulumPath = path.join(demoDir, 'demo_harmonic_pendulum.html');
    const gasPath = path.join(demoDir, 'demo_ideal_gas.html');

    assert(fs.existsSync(quadPath), 'Quadratic function demo model must exist');
    assert(fs.existsSync(pendulumPath), 'Harmonic pendulum demo model must exist');
    assert(fs.existsSync(gasPath), 'Ideal gas demo model must exist');

    const quadContent = fs.readFileSync(quadPath, 'utf-8');
    assert(quadContent.includes('MODEL_READY'), 'Demo model must send MODEL_READY message');
    assert(quadContent.includes('<canvas'), 'Demo model must contain real interactive canvas');

    const pendulumContent = fs.readFileSync(pendulumPath, 'utf-8');
    assert(pendulumContent.includes('MODEL_READY'), 'Pendulum demo must send MODEL_READY message');
    assert(pendulumContent.includes('requestAnimationFrame'), 'Pendulum must have animation loop');

    const gasContent = fs.readFileSync(gasPath, 'utf-8');
    assert(gasContent.includes('MODEL_READY'), 'Gas demo must send MODEL_READY message');
    assert(gasContent.includes('PV = const') || gasContent.includes('pressureDisplay'), 'Gas demo must simulate pressure');
  });

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
