import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444', background: '#111', minHeight: '100vh' }}>
                    <h1>Something went wrong.</h1>
                    <p>Please share this error message:</p>
                    <pre style={{ margin: '1rem auto', maxWidth: '800px', overflow: 'auto', background: '#222', padding: '1rem', textAlign: 'left', borderRadius: '8px' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', cursor: 'pointer', background: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Go Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
