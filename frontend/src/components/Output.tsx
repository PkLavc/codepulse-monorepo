import React, { useState, useEffect } from 'react';
import './Output.css';

interface OutputProps {
  output: string;
  error: string | null;
  isLoading: boolean;
  isTimeout?: boolean;
}

export const Output: React.FC<OutputProps> = ({ 
  output, 
  error, 
  isLoading,
  isTimeout = false 
}) => {
  const [displayText, setDisplayText] = useState('');
  const hasTimeout = isTimeout || error?.includes('Timeout');
  const hasSyntaxError = error && error.includes('SyntaxError');

  useEffect(() => {
    if (isLoading) {
      setDisplayText('Executando código...');
    } else if (output) {
      setDisplayText(output);
    } else if (error) {
      setDisplayText('');
    }
  }, [output, error, isLoading]);

  return (
    <div className="output-container">
      <div className="output-header">
        <h3>📋 Console de Saída</h3>
        {hasTimeout && (
          <span className="timeout-badge">
            ⏱️ Timeout
          </span>
        )}
      </div>

      <div className={`output-panel ${hasTimeout ? 'error-timeout' : hasSyntaxError ? 'error-syntax' : error ? 'error' : ''}`}>
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processando execução...</p>
          </div>
        )}

        {hasTimeout && !isLoading && (
          <div className="timeout-alert">
            <div className="timeout-icon">⏱️</div>
            <div className="timeout-content">
              <h4>Tempo de Execução Excedido</h4>
              <p>O código levou mais de 5 segundos para executar.</p>
              <p className="details">Causas comuns: loops infinitos, operações muito pesadas.</p>
            </div>
          </div>
        )}

        {hasSyntaxError && !isLoading && (
          <div className="error-alert syntax-error">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h4>Erro de Sintáxe</h4>
              <p className="error-message">{error}</p>
            </div>
          </div>
        )}

        {error && !hasTimeout && !hasSyntaxError && !isLoading && (
          <div className="error-alert">
            <div className="error-icon">❌</div>
            <div className="error-content">
              <h4>Erro na Execução</h4>
              <p className="error-message">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && !output && (
          <div className="empty-state">
            <p>🄚 A saída do seu código aparecerá aqui...</p>
          </div>
        )}

        {!isLoading && displayText && !error && (
          <pre className="output-text">{displayText}</pre>
        )}
      </div>

      <div className="output-footer">
        <small>Status: {isLoading ? '⏳ Executando' : hasTimeout ? '⛔ Timeout' : error ? '❌ Erro' : '✅ Concluído'}</small>
      </div>
    </div>
  );
}

export default Output;
