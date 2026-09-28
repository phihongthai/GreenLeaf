import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greenleaf.academy',
  appName: 'GreenLeaf',
  webDir: 'public',
  server: {
    // Production Vercel URL — app connects directly to the cloud without needing your laptop/local server
    url: process.env.CAPACITOR_SERVER_URL || 'https://green-leaf-snowy.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;
