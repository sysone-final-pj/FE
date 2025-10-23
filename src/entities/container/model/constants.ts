export const stateConfig = {
  running: { color: 'bg-blue-500', label: 'Running' },
  restarting: { color: 'bg-yellow-500', label: 'Restarting' },
  dead: { color: 'bg-red-500', label: 'Dead' },
  created: { color: 'bg-gray-300', label: 'Created' },
  exited: { color: 'bg-gray-300', label: 'Exited' },
  paused: { color: 'bg-yellow-500', label: 'Paused' }
};

export const healthConfig = {
  healthy: { color: 'bg-green-500', label: 'Healthy' },
  starting: { color: 'bg-yellow-500', label: 'Starting' },
  unhealthy: { color: 'bg-red-500', label: 'Unhealthy' },
  none: { color: 'bg-gray-300', label: 'None' }
};