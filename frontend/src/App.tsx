import { useState, useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function App() {
  const [code, setCode] = useState('console.log("Hello, CodePulse!")')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const editorRef = useRef(null)

  const handleExecute = async () => {
    setIsLoading(true)
    setOutput('')
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      if (data.output) setOutput(data.output)
      if (data.error) setError(data.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar código')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>🔥 CodePulse - Code Execution Engine</h1>
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
            {isLoading ? '⏳ Executando...' : '▶️ Executar'}
          </button>
        </div>
        <div className="output-section">
          <label>Resultado:</label>
          <div className="output-box">
            {isLoading && <p className="loading">Carregando...</p>}
            {error && <p className="error">❌ Erro: {error}</p>}
            {output && (
              <pre className="output-text">
                <code>{output}</code>
              </pre>
            )}
            {!isLoading && !error && !output && (
              <p className="placeholder">Clique em "Executar" para ver o resultado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
