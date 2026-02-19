import { useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Interfaces for backend responses
interface ExecuteResponse {
  output: string;
  error: string | null;
  executionTime: number;
}

interface QATestResult {
  testId: number;
  status: 'passed' | 'failed';
  actual: string;
}

interface QAExecuteResponse {
  success: boolean;
  results: QATestResult[];
}

export function App() {
  const [code, setCode] = useState('console.log("Hello, CodePulse!")');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [qaResults, setQaResults] = useState<QAExecuteResponse | null>(null); // New state for QA results
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

  const handleExecute = async () => {
    setIsLoading(true);
    setOutput('');
    setError(null);
    setQaResults(null); // Reset QA results

    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.results && Array.isArray(data.results)) { // Check if it's a QA response
        setQaResults(data as QAExecuteResponse);
      } else if (data.output || data.error) { // Regular execution response
        setOutput(data.output || '');
        setError(data.error || null);
      } else {
        setError('Resposta inesperada do servidor.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar código');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>{'🔥 CodePulse - Code Execution Engine'}</h1> {/* Corrected HTML entity */}
        <p>Execução segura de código com alta confiabilidade</p>
      </header>
      <div className="container">
        <div className="editor-section">
          <label>Código:</label>
          <MonacoEditor
            height="400px"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            ref={editorRef}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="execute-btn"
          >
            {isLoading ? "⏳ Executando..." : "▶️ Executar"}
          </button>
        </div>
        <div className="output-section">
          <label>Resultado:</label>
          <div className="output-box">
            {isLoading && <p className="loading">Carregando...</p>}
            {error && <p className="error">❌ Erro: {error}</p>}

            {/* Display QA Results */}
            {qaResults && ( 
              <div>
                <h3>Resultados do QA: {qaResults.success ? '✅ Todos os testes passaram!' : '❌ Falha em alguns testes.'}</h3>
                <ul>
                  {qaResults.results.map((test) => (
                    <li key={test.testId}>
                      {test.status === 'passed' ? '✅' : '❌'} Teste {test.testId}: {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      {test.status === 'failed' && ( 
                        <p className="test-actual-output">Saída real: {test.actual}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display single output for non-QA execution */}
            {output && !qaResults && ( 
              <pre className="output-text">
                <code>{output}</code>
              </pre>
            )}

            {!isLoading && !error && !output && !qaResults && (
              <p className="placeholder">Clique em 'Executar' para ver o resultado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
