import { Output } from './components/Output'
import './App.css'

export function App() {
  return (
    <div className="app">
      <header>
        <h1>CodePulse - Code Execution Engine</h1>
      </header>
      <main>
        <Output output="" error={null} isLoading={false} />
      </main>
    </div>
  )
}

export default App
