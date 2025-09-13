import React from 'react';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Send to logging service if configured
    try {
      // eslint-disable-next-line no-console
      console.error('Unhandled render error:', error, info);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
          <div className="max-w-2xl w-full bg-muted/5 border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred while rendering the application. Details are shown below for debugging.</p>
            <pre className="text-xs whitespace-pre-wrap bg-background/80 rounded p-3 overflow-auto" style={{ maxHeight: 300 }}>
              {this.state.error ? `${this.state.error.name}: ${this.state.error.message}\n${(this.state.error.stack || '')}` : 'No error information'}
            </pre>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={() => window.location.reload()}>
                Reload
              </button>
              <button className="px-3 py-2 rounded border" onClick={() => { window.location.href = '/'; }}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
