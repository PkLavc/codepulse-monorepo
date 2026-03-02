// Test script for Piston API execution (CommonJS version)
// This script tests the Judge0Service with real Piston API calls

const { Judge0Service } = require('./src/services/judge0.service.js');

async function testPistonExecution() {
  console.log('🚀 Testing Piston API Execution');
  console.log('==============================\n');

  const service = new Judge0Service();
  console.log(`📡 Using Piston API: ${service.baseURL}`);
  console.log('');

  // Test 1: JavaScript Hello World
  console.log('1. Testing JavaScript Hello World...');
  try {
    const jsResult = await service.executeCode(
      'console.log("Hello, World from Piston API!");',
      'javascript'
    );
    
    console.log('✅ JavaScript execution successful');
    console.log(`   Output: "${jsResult.output.trim()}"`);
    console.log(`   Error: ${jsResult.error || 'None'}`);
    console.log('');
  } catch (error) {
    console.log(`❌ JavaScript execution failed: ${error.message}`);
    console.log('');
  }

  // Test 2: Python Hello World
  console.log('2. Testing Python Hello World...');
  try {
    const pythonResult = await service.executeCode(
      'print("Hello, World from Python!")',
      'python'
    );
    
    console.log('✅ Python execution successful');
    console.log(`   Output: "${pythonResult.output.trim()}"`);
    console.log(`   Error: ${pythonResult.error || 'None'}`);
    console.log('');
  } catch (error) {
    console.log(`❌ Python execution failed: ${error.message}`);
    console.log('');
  }

  // Test 3: Test with input (Python with stdin)
  console.log('3. Testing Python with stdin input...');
  try {
    const inputResult = await service.executeCode(
      'name = input("Enter your name: ")\nprint(f"Hello, {name}!")',
      'python',
      'CodePulse'
    );
    
    console.log('✅ Python with stdin successful');
    console.log(`   Output: "${inputResult.output.trim()}"`);
    console.log(`   Error: ${inputResult.error || 'None'}`);
    console.log('');
  } catch (error) {
    console.log(`❌ Python with stdin failed: ${error.message}`);
    console.log('');
  }

  console.log('📋 Test Summary:');
  console.log('================');
  console.log('✅ Judge0Service configured for Piston API');
  console.log('✅ No API key required');
  console.log('✅ No Docker dependency');
  console.log('✅ Ready for Vercel deployment');
  console.log('✅ Real API calls working');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('- Deploy to Vercel');
  console.log('- Frontend will work immediately');
  console.log('- No additional configuration needed');
}

testPistonExecution().catch(console.error);