import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EduListen ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (_) {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-amber-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Đang làm mới ứng dụng học tiếng Trung
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trình duyệt vừa phát sinh gián đoạn tạm thời. Bạn hãy bấm nút bên dưới để tải lại dữ liệu lớp học mới nhất nhé.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Xóa bộ nhớ đệm & Tải lại
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
