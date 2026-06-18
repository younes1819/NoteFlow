import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useTheme } from '@/constants/theme';
import { getToken } from '@/lib/authStorage';

export default function Index() {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    void getToken().then((token) => {
      setHasToken(!!token);
      setChecked(true);
    });
  }, []);

  if (!checked) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.foreground} />
      </View>
    );
  }

  return <Redirect href={hasToken ? '/(tabs)/notas' : '/auth'} />;
}
