import { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import logo from './assets/logo.png';
import './App.css';

interface ImportMetaEnv {
  VITE_API_URL?: string;
}

const API_URL = ((import.meta as unknown) as { env: ImportMetaEnv }).env.VITE_API_URL || 'https://codepulse-monorepo-backend.vercel.app';

interface QATestResult {
  testId: number;
  status: 'passed' | 'failed';
  actual: string;
}

interface QAExecuteResponse {
  success: boolean;
  results: QATestResult[];
}

interface FixCodeResponse {
  code: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python*' },
  { value: 'java', label: 'Java*' },
  { value: 'cpp', label: 'C++*' },
  { value: 'csharp', label: 'C#*' },
  { value: 'php', label: 'PHP*' },
  { value: 'go', label: 'Go*' },
  { value: 'ruby', label: 'Ruby*' },
];

export function App() {
  const [code, setCode] = useState('// Welcome to CodePulse\nconsole.log("System Ready");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [qaResults, setQaResults] = useState<QAExecuteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleExecute = async () => {
    setIsLoading(true);
    setOutput('');
    setError(null);
    setQaResults(null);

    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (data.results && Array.isArray(data.results)) {
        setQaResults(data as QAExecuteResponse);
      } else if (data.output || data.error) {
        setOutput(data.output || '');
        setError(data.error || null);
      } else {
        setError('Unexpected server response format.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Execution error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixCode = async () => {
    setIsFixing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      const data = (await response.json()) as FixCodeResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || 'Unable to adjust code');
      }

      if (typeof data.code !== 'string') {
        throw new Error('Invalid fix response format');
      }

      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code adjustment failed');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>
          <img src={logo} alt="CodePulse Logo" className="header-logo" />
          CodePulse - Engineering-Focused IDE
        </h1>
        <p>High-performance code execution with automated QA pipeline</p>
      </header>

      <div className="container">
        <div className="editor-section">
          <label>Source Code:</label>
          <div className="editor-controls">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="language-select"
              aria-label="Selecionar linguagem"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleFixCode}
              disabled={isLoading || isFixing}
              className="fix-btn"
            >
              {isFixing ? '🔧 Ajustando...' : '🔧 Ajustar Código'}
            </button>
            <button
              onClick={handleExecute}
              disabled={isLoading || isFixing}
              className="execute-btn"
            >
              {isLoading ? '⏳ Processing...' : '▶️ Launch Execution'}
            </button>
          </div>
          <MonacoEditor
            height="450px"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className="output-section">
          <label>Terminal Output / QA Results:</label>
          <div className="output-box">
            {isLoading && <p className="loading">Accessing sandboxed environment...</p>}
            {error && <p className="error">❌ System Error: {error}</p>}

            {qaResults && ( 
              <div className="qa-container">
                <h3 className={qaResults.success ? 'status-pass' : 'status-fail'}>
                  {qaResults.success ? '✅ All QA Tests Passed' : '❌ QA Pipeline Failed'}
                </h3>
                <ul className="test-list">
                  {qaResults.results.map((test) => (
                    <li key={test.testId} className={`test-item ${test.status}`}>
                      <span className="test-icon">{test.status === 'passed' ? '✔️' : '✘️'}</span>
                      <span className="test-name">Test Case #{test.testId}</span>
                      {test.status === 'failed' && ( 
                        <pre className="test-diff">Expected output mismatch. Actual: {test.actual}</pre>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {output && !qaResults && ( 
              <pre className="output-text">
                <code>{output}</code>
              </pre>
            )}

            {!isLoading && !error && !output && !qaResults && (
              <p className="placeholder">Awaiting code execution... Click "Launch" to start.</p>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>
          CodePulse v1.0.0 | 
          <a href="https://github.com/lojadosapo" target="_blank" rel="noreferrer">Engineering Portfolio</a>
          | Professional Software Quality Assurance Showcase
        </p>
      </footer>
    </div>
  );
}

export default App;
