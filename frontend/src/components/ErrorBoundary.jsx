import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          color: '#e2e8f0'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#F9E4A4' }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: '1.5rem', maxWidth: '500px', lineHeight: 1.6 }}>
            An unexpected error occurred while loading this page.
            Please try refreshing or navigate back to the home page.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '6px',
                background: '#2E7D32',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
