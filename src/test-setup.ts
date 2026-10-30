import '@testing-library/jest-dom';

// Mock Web Audio API for tests
class AudioContextMock {
  state = 'running';
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
      start: () => {},
      stop: () => {},
      disconnect: () => {},
    };
  }
  createGain() {
    return {
      gain: {
        value: 1,
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: { setValueAtTime: () => {}, value: 100 },
      Q: { value: 1 },
      connect: () => {},
    };
  }
  createBuffer() {
    return {
      getChannelData: () => new Float32Array(100),
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: () => {},
      start: () => {},
    };
  }
  resume() {
    return Promise.resolve();
  }
}

(window as any).AudioContext = AudioContextMock;
(window as any).webkitAudioContext = AudioContextMock;
