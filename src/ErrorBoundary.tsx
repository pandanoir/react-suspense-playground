import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <p role="alert">
        {this.state.error.message}（「キャッシュを削除」で再試行）
      </p>
    ) : (
      this.props.children
    );
  }
}
