import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, ErrorState } from '@aura-grid/ui';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/** Global error boundary so a render failure never blanks the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Render error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-6">
          <ErrorState
            title="The Grid destabilized"
            description={this.state.message ?? 'An unexpected error occurred.'}
            action={
              <Button onClick={() => window.location.reload()}>Reinitialize</Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
