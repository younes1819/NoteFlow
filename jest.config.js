module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/node_modules/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|' +
      'expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|' +
      'react-navigation|@react-navigation/.*|@shopify/.*|' +
      '@gluestack-ui/.*|@legendapp/.*|nativewind|react-native-css-interop|' +
      'react-native-reanimated|react-native-gesture-handler)',
  ],
};
