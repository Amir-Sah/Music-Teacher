import React from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application crashed:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetLocalData = () => {
    const confirmed = window.confirm(
      "This will remove all locally saved application data and reload the app. Continue?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Something went wrong
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  The app encountered an unexpected error.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 overflow-auto">
              {this.state.error?.message || "Unknown application error"}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>

              <button
                onClick={this.handleResetLocalData}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-red-300 hover:bg-red-50 text-red-700 font-semibold rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Reset Local Data
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400 text-center">
              If this issue persists, restore from a recent backup file.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}