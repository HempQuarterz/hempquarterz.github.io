import React from 'react';
import '../styles/error-boundary.css';

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
        <div className="error-boundary">
          <h1 className="error-boundary-title">Something went wrong</h1>
          <p className="error-boundary-body">
            An unexpected error occurred while loading this page.
            Please try refreshing or navigate back to the home page.
          </p>
          <div className="error-boundary-actions">
            <button
              type="button"
              onClick={this.handleReset}
              className="error-boundary-btn"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="error-boundary-btn error-boundary-btn--primary"
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
