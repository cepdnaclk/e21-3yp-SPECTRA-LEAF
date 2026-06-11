import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  children: ReactNode;
}

export default function ScreenBackground({ children }: Props) {
  return <View style={styles.background}>{children}</View>;
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
