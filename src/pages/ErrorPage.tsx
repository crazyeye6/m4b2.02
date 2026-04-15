import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  onHome: () => void;
  onRetry?: () => void;
  message?: string;
}

export default function ErrorPage({ onHome, onRetry, message }: ErrorPageProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-9 h-9 text-red-500" />
        </div>

        <h1 className="text-[#1d1d1f] font-semibold text-3xl mb-3 tracking-[-0.02em]">Something went wrong</h1>
        <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-3">
          {message || 'An unexpected error occurred. Our team has been notified.'}
        </p>
        <p className="text-[#aeaeb2] text-[13px] mb-10">
          If this keeps happening, please contact support at{' '}
          <a href="mailto:support@endingthisweek.media" className="text-blue-600 hover:text-blue-700 transition-colors">
            support@endingthisweek.media
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 bg-white border border-black/[0.08] hover:border-black/[0.15] text-[#1d1d1f] font-semibold px-6 py-3 rounded-2xl text-[14px] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-[#1d1d1f] hover:bg-[#3a3a3c] text-white font-semibold px-6 py-3 rounded-2xl text-[14px] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
