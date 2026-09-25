import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCoreMedia } from './utils/mediaPreloader';

// Initialize immediate background preloading for instant video display
try {
  preloadCoreMedia();
} catch (e) {
  console.warn('Preloader notice:', e);
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Caught by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#020306',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            background: '#0a0e24',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(99,102,241,0.2)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#38bdf8' }}>
              VidoEdit Pro Recovery
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected rendering issue occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
