import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: We need to wire this up to Sentry or PostHog before v1 launch
    console.error("Uncaught frontend error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-red-500 font-mono p-6">
          <div className="border-[3px] border-red-900 p-8 max-w-2xl bg-black shadow-2xl">
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-widest text-red-600">Fatal System Fault</h1>
            <p className="mb-6 text-zinc-400">The local state container crashed. This is usually caused by a corrupted IndexedDB entry.</p>
            <div className="p-4 bg-zinc-900 border border-red-900/50 text-sm overflow-auto mb-6">
              <code>{this.state.errorMsg}</code>
            </div>
            <button 
              className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white transition-colors uppercase text-sm font-bold tracking-wider"
              onClick={() => {
                // Nuke everything and reload
                localStorage.clear();
                window.location.reload();
              }}
            >
              Factory Reset & Reload
            </button>
            <p className="mt-4 text-xs text-zinc-600">// FIXME: This nuke button is a hack, need graceful DB recovery later</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
