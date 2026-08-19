import React from 'react';
import AIChat from '../../components/ai/AIChat.jsx';

class AiAdvisorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AiAdvisor Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4 max-w-2xl mx-auto my-12">
          <h3 className="text-lg font-bold text-rose-400">AI Financial Advisor Render Error</h3>
          <p className="text-xs text-slate-300 font-mono bg-black/40 p-4 rounded-xl overflow-x-auto text-left">
            {this.state.error?.toString()}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AiAdvisorPage = () => {
  return (
    <AiAdvisorErrorBoundary>
      <div className="flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden">
        <AIChat />
      </div>
    </AiAdvisorErrorBoundary>
  );
};

export default AiAdvisorPage;
