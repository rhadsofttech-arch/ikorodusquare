import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Rendering Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full p-8 my-4 bg-red-50/80 border border-red-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {this.props.fallbackTitle || 'Something went wrong displaying this section'}
            </h3>
            <p className="text-xs text-slate-600">
              {this.state.error?.message || 'A temporary display error occurred. Please try refreshing.'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
