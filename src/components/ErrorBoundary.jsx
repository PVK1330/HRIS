import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            An unexpected error occurred. You can try reloading the page or
            return to the home screen.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="mb-6 text-left text-xs bg-gray-100 text-gray-700 rounded-lg p-4 overflow-auto max-h-40 border border-gray-200">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#0E9F6E] text-white text-sm font-semibold rounded-lg hover:bg-[#057A55] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0E9F6E] focus:ring-offset-2"
            >
              Reload page
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="px-5 py-2.5 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              Go to home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
