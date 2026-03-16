import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="auto">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-xl font-bold text-foreground">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-muted-foreground text-sm">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {this.state.error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-lg p-3 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              إعادة تحميل الصفحة — Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
