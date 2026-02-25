const path = require('path');
const axios = require('axios');

// Queue of mock responses that axios.post will return (each should be { data: ... })
let mockQueue = [];

axios.post = async function () {
  if (mockQueue.length === 0) {
    throw new Error('No mock response available');
  }
  const resp = mockQueue.shift();
  return resp;
};

function pushMock(resp) {
  mockQueue.push({ data: resp });
}

(async () => {
  try {
    const modPath = path.resolve(__dirname, 'judge0.service.cjs');
    const svcModule = require(modPath);
    const Judge0Service = svcModule.Judge0Service;

    const service = new Judge0Service();

    // Test 1: executeCode success (JS)
    pushMock({
      language: 'javascript',
      version: '18.15.0',
      run: {
        stdout: 'Hello, World!\n',
        stderr: '',
        code: 0,
        signal: null,
        output: 'Hello, World!\n'
      }
    });

    const r1 = await service.executeCode('console.log("Hello, World!")', 'javascript');
    console.log('Test executeCode success ->', r1);

    // Test 2: executeCode error
    pushMock({
      language: 'javascript',
      version: '18.15.0',
      run: {
        stdout: '',
        stderr: 'SyntaxError: Unexpected token',
        code: 1,
        signal: null,
        output: 'SyntaxError: Unexpected token'
      }
    });

    const r2 = await service.executeCode('invalid code', 'javascript');
    console.log('Test executeCode error ->', r2);

    // Test 3: executeCode with stdin (python)
    pushMock({
      language: 'python',
      version: '3.10.0',
      run: {
        stdout: '42\n',
        stderr: '',
        code: 0,
        signal: null,
        output: '42\n'
      }
    });

    const r3 = await service.executeCode('print(int(input()) + int(input()))', 'python', '10\n32');
    console.log('Test executeCode stdin ->', r3);

    // Test 4: executeWithQA passed
    pushMock({
      language: 'python',
      version: '3.10.0',
      run: {
        stdout: '42\n',
        stderr: '',
        code: 0,
        signal: null,
        output: '42\n'
      }
    });

    const testCases1 = [{ input: '10\n32', expected: '42' }];
    const qa1 = await service.executeWithQA('print(int(input()) + int(input()))', 'python', testCases1);
    console.log('Test executeWithQA (passed) ->', qa1);

    // Test 5: executeWithQA failed
    pushMock({
      language: 'python',
      version: '3.10.0',
      run: {
        stdout: '40\n',
        stderr: '',
        code: 0,
        signal: null,
        output: '40\n'
      }
    });

    const testCases2 = [{ input: '10\n32', expected: '42' }];
    const qa2 = await service.executeWithQA('print(int(input()) + int(input()))', 'python', testCases2);
    console.log('Test executeWithQA (failed) ->', qa2);

    // Test 6: multiple test cases
    pushMock({ language: 'python', version: '3.10.0', run: { stdout: '42\n', stderr: '', code: 0, signal: null, output: '42\n' } });
    pushMock({ language: 'python', version: '3.10.0', run: { stdout: '100\n', stderr: '', code: 0, signal: null, output: '100\n' } });
    pushMock({ language: 'python', version: '3.10.0', run: { stdout: '0\n', stderr: '', code: 0, signal: null, output: '0\n' } });

    const testCases3 = [
      { input: '10\n32', expected: '42' },
      { input: '50\n50', expected: '100' },
      { input: '0\n0', expected: '0' }
    ];

    const qa3 = await service.executeWithQA('print(int(input()) + int(input()))', 'python', testCases3);
    console.log('Test executeWithQA (multiple) ->', qa3);

    console.log('\nManual tests completed successfully.');
  } catch (err) {
    console.error('Error running manual tests:', err);
    process.exitCode = 1;
  }
})();
