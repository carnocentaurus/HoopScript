const IS_DEV = process.env.APP_VARIANT === 'development';
const ICON_PATH = IS_DEV 
  ? './assets/images/icon/dev_icon.jpg' 
  : './assets/images/icon/hoopscript_icon_resized.png';

module.exports = {
  expo: {
    name: IS_DEV ? 'Dev' : 'HoopScript',
    slug: 'HoopScript',
    version: '1.0.1',
    orientation: 'portrait',
    icon: ICON_PATH,
    jsEngine: 'hermes',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/icon/hoopscript_icon_resized.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true,
      jsEngine: 'hermes',
      bundleIdentifier: IS_DEV 
        ? 'com.carnocentaurus.HoopScript.dev' 
        : 'com.carnocentaurus.HoopScript'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: ICON_PATH,
        backgroundColor: IS_DEV ? '#00FFFF' : '#B34726'
      },
      jsEngine: 'hermes',
      softwareKeyboardLayoutMode: 'pan',
      versionCode: 3,
      predictiveBackGestureEnabled: false,
      permissions: [],
      package: IS_DEV 
        ? 'com.carnocentaurus.HoopScript.dev' 
        : 'com.carnocentaurus.HoopScript'
    },
    web: {
      favicon: './assets/images/icon/hoopscript_icon_resized.png'
    },
    plugins: [
      'expo-font',
      'expo-audio'
    ],
    extra: {
      eas: {
        projectId: 'f36aaf0d-7c26-4db4-b079-0225ae1c25d4'
      }
    }
  }
};