/**
 * ROBOFEST INTEGRATION ADAPTER
 * 
 * Provides a clean boundary for communicating with the RoboFest operational engine.
 * Maps RoboFest's internal SSE realtime stream to the Senior /operations/live UI.
 */

const ROBOFEST_ENGINE_URL = import.meta.env.VITE_ROBOFEST_ENGINE_URL || 'http://localhost:3000';

class RoboFestAdapter {
  constructor() {
    this.eventSource = null;
    this.listeners = new Set();
    this.connectionState = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, ERROR
    
    this.state = {
      robot: null,
      mission: null,
      safety: null,
      telemetry: null,
      health: null,
    };
  }

  connect(token) {
    if (this.connectionState === 'CONNECTING' || this.connectionState === 'CONNECTED') {
      return;
    }

    this.updateConnectionState('CONNECTING');
    
    // Auth token must be provided or passed via credentials if proxying
    // Currently assuming token is set as a cookie or passed in URL for EventSource
    const url = new URL(`${ROBOFEST_ENGINE_URL}/api/realtime`);
    if (token) url.searchParams.append('token', token);

    try {
      this.eventSource = new EventSource(url.toString(), { withCredentials: true });

      this.eventSource.addEventListener('connected', (e) => {
        this.updateConnectionState('CONNECTED');
      });

      this.eventSource.addEventListener('message', (e) => {
        try {
          const payload = JSON.parse(e.data);
          this.handlePayload(payload);
        } catch (err) {
          console.error('RoboFest Adapter: Failed to parse message payload', err);
        }
      });

      this.eventSource.onerror = (e) => {
        this.updateConnectionState('ERROR');
        this.disconnect();
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

  handlePayload(payload) {
    // Process different message types based on the RoboFest data contract
    const { type, data } = payload;
    
    switch (type) {
      case 'ROBOT_STATE':
        this.state.robot = data;
        break;
      case 'MISSION_STATE':
        this.state.mission = data;
        break;
      case 'SAFETY_STATE':
        this.state.safety = data;
        break;
      case 'TELEMETRY':
        this.state.telemetry = data;
        break;
      case 'ROBOT_HEALTH':
        this.state.health = data;
        break;
      case 'EVENT':
        // pass through to listeners
        break;
      default:
        // Generic update
        break;
    }
    
    this.notifyListeners(payload);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Send immediate state sync
    callback({ type: 'CONNECTION_STATE', payload: this.connectionState });
    if (this.state.robot) callback({ type: 'ROBOT_STATE', payload: this.state.robot });
    if (this.state.safety) callback({ type: 'SAFETY_STATE', payload: this.state.safety });
    
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
