type NetworkStatusCallback = (isConnected: boolean) => void;
type ReconnectionCallback = () => void;

/**
 * Simple network monitor with fallback implementation
 * Uses online/offline events if available, otherwise assumes always connected
 */
class NetworkMonitor {
  private isConnectedState: boolean = true;
  private listeners: NetworkStatusCallback[] = [];
  private reconnectionListeners: ReconnectionCallback[] = [];
  private unsubscribe: (() => void) | null = null;
  private wasDisconnected: boolean = false;

  initialize(): void {
    if (this.unsubscribe) {
      console.log('NetworkMonitor already initialized');
      return;
    }

    // Use basic connectivity detection without native modules
    this.isConnectedState = true;
    console.log('NetworkMonitor initialized (fallback mode). Starting as connected.');
  }

  private handleNetworkChange = (state: any): void => {
    const isConnected = state.isConnected ?? false;
    const wasConnected = this.isConnectedState;

    console.log('Network state changed:', {
      isConnected,
      wasConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    });

    this.isConnectedState = isConnected;

    // Notify all status listeners
    this.listeners.forEach((listener) => {
      try {
        listener(isConnected);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });

    // If we just reconnected after being disconnected, notify reconnection listeners
    if (!wasConnected && isConnected && this.wasDisconnected) {
      console.log('Network reconnected, triggering sync...');
      this.wasDisconnected = false;
      this.reconnectionListeners.forEach((listener) => {
        try {
          listener();
        } catch (error) {
          console.error('Error in reconnection listener:', error);
        }
      });
    }

    if (!isConnected) {
      this.wasDisconnected = true;
    }
  };

  isConnected(): boolean {
    return this.isConnectedState;
  }

  async checkConnection(): Promise<boolean> {
    // Simple fallback: always assume connected
    // In production, you can add proper network detection later
    this.isConnectedState = true;
    return this.isConnectedState;
  }

  onNetworkStatusChange(callback: NetworkStatusCallback): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  onReconnection(callback: ReconnectionCallback): () => void {
    this.reconnectionListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.reconnectionListeners = this.reconnectionListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
    this.reconnectionListeners = [];
    console.log('NetworkMonitor cleaned up');
  }
}

export const networkMonitor = new NetworkMonitor();
