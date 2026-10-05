const USE_MOCK = false;

export const generateMockData = () => ({
  timestamp: new Date().toISOString(),
  color: (Math.random() * 100).toFixed(2),
  turbidity: (Math.random() * 10).toFixed(2),
  connected: true,
});

export default USE_MOCK;