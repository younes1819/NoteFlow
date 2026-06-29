jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const passthroughEntry = {
    delay: () => passthroughEntry,
    duration: () => passthroughEntry,
    springify: () => passthroughEntry,
  };

  const AnimatedView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref })
  );
  AnimatedView.displayName = 'Animated.View';

  return {
    __esModule: true,
    default: { View: AnimatedView, createAnimatedComponent: (c) => c },
    FadeInDown: passthroughEntry,
    FadeOut: passthroughEntry,
    FadeIn: passthroughEntry,
    useSharedValue: (value) => ({ value }),
    useAnimatedStyle: () => ({}),
    withSpring: (value) => value,
    withTiming: (value) => value,
    runOnJS: (fn) => fn,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');

  const createGesture = () => {
    const gesture = {};
    gesture.activeOffsetX = () => gesture;
    gesture.activeOffsetY = () => gesture;
    gesture.onUpdate = () => gesture;
    gesture.onEnd = () => gesture;
    gesture.onStart = () => gesture;
    return gesture;
  };

  return {
    Gesture: { Pan: createGesture, Tap: createGesture },
    GestureDetector: ({ children }) => children,
    GestureHandlerRootView: ({ children }) =>
      React.createElement(View, null, children),
  };
});

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View } = require('react-native');

  const FlashList = ({ data = [], renderItem, keyExtractor }) =>
    React.createElement(
      View,
      null,
      data.map((item, index) =>
        React.createElement(
          React.Fragment,
          { key: keyExtractor ? keyExtractor(item, index) : index },
          renderItem({ item, index })
        )
      )
    );

  return { FlashList };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = (props) => React.createElement(Text, props, props.name);
  return { Ionicons: Icon, AntDesign: Icon, MaterialIcons: Icon };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
