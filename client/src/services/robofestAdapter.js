/**
 * SENIOR OPERATIONS ADAPTER
 * 
 * Provides a clean boundary for communicating with the RoboFest operational engine.
 * Currently configured for the SERVER-SIDE GATEWAY architecture because direct 
 * Cross-Origin SSE to RoboFest is not supported due to CORS and Cookie constraints.
 */

// We will point to the Senior Server API (which will proxy to RoboFest)
const SENIOR_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class RoboFestAdapter {
  constructor() {
    this.eventSource = null;
    this.listeners = new Set();
    this.connectionState = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, DEGRADED, ERROR
    
    this.state = {
      robot: null,
      mission: null,
      safety: null,
      telemetry: null,
      health: null,
    };
  }

  connect() {
    if (this.connectionState === 'CONNECTING' || this.connectionState === 'CONNECTED') {
      return;
    }

    this.updateConnectionState('CONNECTING');
    
    // The browser connects to its SAME-ORIGIN Senior backend.
    // The Senior backend is responsible for maintaining the auth token and proxying the RoboFest SSE.
    const url = new URL(`${SENIOR_API_URL}/operations/stream`);

    try {
      // withCredentials ensures the Senior session cookie is sent to the Senior backend.
      this.eventSource = new EventSource(url.toString(), { withCredentials: true });

      this.eventSource.addEventListener('connected', (e) => {
        this.updateConnectionState('CONNECTED');
      });

      this.eventSource.addEventListener('message', (e) => {
        try {
          const rawPayload = JSON.parse(e.data);
          this.handlePayload(rawPayload);
        } catch (err) {
          console.error('RoboFest Adapter: Failed to parse message payload', err);
        }
      });

      this.eventSource.onerror = (e) => {
        this.updateConnectionState('ERROR');
        this.disconnect();
        // Basic backoff could be implemented here
      };
    } catch (err) {
      this.updateConnectionState('ERROR');
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.updateConnectionState('DISCONNECTED');
  }

  updateConnectionState(state) {
    this.connectionState = state;
    this.notifyListeners({ type: 'CONNECTION_STATE', payload: state });
  }

  handlePayload(rawPayload) {
    // Process actual RoboFest message types
    const { type, payload, source, timestamp } = rawPayload;
    
    switch (type) {
      case 'RUNTIME_STATE_UPDATED':
        this.state.robot = payload;
        break;
      case 'MISSION_UPDATED':
        this.state.mission = payload;
        break;
      case 'TELEMETRY_UPDATED':
        this.state.telemetry = payload;
        break;
      case 'EVENT_CREATED':
        // pass through
        break;
      default:
        break;
    }
    
    this.notifyListeners(rawPayload);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Send immediate state sync
    callback({ type: 'CONNECTION_STATE', payload: this.connectionState });
    if (this.state.robot) callback({ type: 'RUNTIME_STATE_UPDATED', payload: this.state.robot });
    if (this.state.mission) callback({ type: 'MISSION_UPDATED', payload: this.state.mission });
    if (this.state.telemetry) callback({ type: 'TELEMETRY_UPDATED', payload: this.state.telemetry });
    
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => cb(event));
  }

  getState() {
    return { ...this.state, connectionState: this.connectionState };
  }
}

export const robofestAdapter = new RoboFestAdapter();
