import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

type NetworkStatusCallback = (isConnected: boolean) => void;
type ReconnectionCallback = () => void;

class NetworkMonitor {
  private isConnectedState: boolean = true;
  private listeners: NetworkStatusCallback[] = [];
  private reconnectionListeners: ReconnectionCallback[] = [];
  private unsubscribe: NetInfoSubscription | null = null;
  private wasDisconnected: boolean = false;

  initialize(): void {
    if (this.unsubscribe) {
      console.log('NetworkMonitor already initialized');
      return;
    }

    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);

    // Get initial state
    NetInfo.fetch().then((state) => {
      this.isConnectedState = state.isConnected ?? false;
      console.log('NetworkMonitor initialized. Connected:', this.isConnectedState);
    });
  }

  private handleNetworkChange = (state: NetInfoState): void => {
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
    try {
      const state = await NetInfo.fetch();
      this.isConnectedState = state.isConnected ?? false;
      return this.isConnectedState;
    } catch (error) {
      console.error('Failed to check network connection:', error);
      return false;
    }
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
