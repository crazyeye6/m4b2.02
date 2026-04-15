import { Component, type ReactNode } from 'react';
import ErrorPage from '../pages/ErrorPage';
import Header from './Header';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
          <Header
            onListSlot={() => {}}
            onAdmin={() => {}}
            onDashboard={() => {}}
            onSignIn={() => {}}
            onHome={this.handleReset}
          />
          <ErrorPage
            onHome={this.handleReset}
            onRetry={this.handleReset}
            message={this.state.message}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
