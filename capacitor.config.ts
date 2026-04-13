
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.carpool', // Replace with your actual app ID in your local version

  appName: 'Kamili Ride',
  webDir: 'dist',
  server: {
    url: 'http://192.168.0.230:3000', // Default to localhost, developers can change to their needs

    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f6f6f6',
      showSpinner: false
    }
  }
};

export default config;
