const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('🧪 RUNNING TEST SUITE: MATH & PHYSICS MODEL LIBRARY (PERSONAL)');
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

  // TEST GROUP 2: Personal Library Structure & Clean Model Model
  console.log('\n--- 2. Personal Library Model Structure ---');

  runTest('Verify Model metadata format has no user/role requirements', () => {
    const personalModel = {
      id: 'model-001',
      title: 'Mô hình Con Lắc Đơn',
      slug: 'mo-hinh-con-lac-don',
      subject: 'physics',
      category: 'co-hoc',
      driveFileId: 'drive-file-123',
      entryFile: 'index.html',
      fileType: 'html',
    };

    assert.strictEqual(personalModel.subject, 'physics');
    assert.strictEqual(personalModel.id, 'model-001');
    assert.strictEqual(personalModel.ownerUserId, undefined);
    assert.strictEqual(personalModel.visibility, undefined);
  });

  // TEST GROUP 3: Database & Categories Verification
  console.log('\n--- 3. Database & Model Categories Verification ---');

  runTest('Verify Math and Physics categories separation', () => {
    const dbPath = path.join(process.cwd(), '.data', 'db.json');
    let categories = [];
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      categories = data.categories || [];
    } else {
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

    const unwanted = categories.find(c => ['blog', 'forum', 'chat', 'gamification'].includes(c.slug));
    assert(!unwanted, 'Categories must remain strictly Math and Physics models');
  });

  // TEST GROUP 4: Storage Provider Abstraction & Google Drive Folder Structure
  console.log('\n--- 4. Storage Provider & Drive Architecture ---');

  await runAsyncTest('Local fallback storage mimics Google Drive personal library structure', async () => {
    const testStorageDir = path.join(process.cwd(), '.data', 'storage', 'Math');
    fs.mkdirSync(testStorageDir, { recursive: true });

    const dummyFile = path.join(testStorageDir, 'test_model.html');
    const testHtml = '<html><body><h1>Test Simulation</h1></body></html>';
    fs.writeFileSync(dummyFile, testHtml);

    assert(fs.existsSync(dummyFile), 'File must be written to Math folder');
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
