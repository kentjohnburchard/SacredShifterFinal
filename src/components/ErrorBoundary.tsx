import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 text-gray-100 p-4">
          <div className="max-w-md w-full bg-dark-200 rounded-2xl p-6 border border-dark-300 shadow-lg">
            <h1 className="text-xl font-bold mb-4 text-red-400">Something went wrong</h1>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">The application encountered an unexpected error:</p>
              <pre className="bg-dark-300 p-3 rounded-lg overflow-auto text-sm text-gray-300 max-h-48">
                {this.state.error?.toString()}
              </pre>
            </div>
            <button
              onClick={() => {
                // Reset the error state and attempt to recover
                this.setState({ hasError: false, error: null, errorInfo: null });
                // Reload the page
                window.location.reload();
              }}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;