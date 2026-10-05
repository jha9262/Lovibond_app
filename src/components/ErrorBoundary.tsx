import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    try {
      sessionStorage.removeItem('lovibond_last_settings_route');
    } catch { }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/LIVE';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-industrial-50 p-4">
          <div className="max-w-lg w-full rounded-2xl border border-red-200 bg-white p-6 shadow-xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 font-black text-xl">
              !
            </div>
            <h2 className="mb-2 text-lg font-black text-industrial-900 uppercase tracking-tight">Something went wrong</h2>
            <p className="text-xs text-industrial-600 mb-4">
              An unexpected error occurred while rendering the application.
            </p>

            {this.state.error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-left overflow-auto max-h-48 text-[11px] font-mono text-red-700">
                <p className="font-bold">{this.state.error.name || 'Error'}: {String(this.state.error.message || this.state.error)}</p>
                {this.state.error.stack && (
                  <pre className="mt-1 text-[10px] text-red-600/80 whitespace-pre-wrap">{String(this.state.error.stack)}</pre>
                )}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl border border-industrial-200 text-xs font-bold text-industrial-700 hover:bg-industrial-100 transition-colors uppercase"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{ backgroundColor: '#4a35e8' }}
                className="px-5 py-2 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition-colors uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
