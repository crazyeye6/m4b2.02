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
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-9 h-9 text-red-400" />
        </div>

        <h1 className="text-[#e6edf3] font-bold text-2xl mb-3">Something went wrong</h1>
        <p className="text-[#8b949e] text-sm leading-relaxed mb-3">
          {message || 'An unexpected error occurred. Our team has been notified.'}
        </p>
        <p className="text-[#6e7681] text-xs mb-8">
          If this keeps happening, please contact support at{' '}
          <a href="mailto:support@endingthisweek.media" className="text-emerald-500 hover:text-emerald-400 transition-colors">
            support@endingthisweek.media
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-all"
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
