module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for Moti + Reanimated (also supported on Expo Web).
      'react-native-reanimated/plugin',
    ],
  };
};

