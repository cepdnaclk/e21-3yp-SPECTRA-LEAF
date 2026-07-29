import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { AppTheme, useAppTheme } from '../theme';

interface Props extends ViewProps {
  padded?: boolean;
}

export default function Card({ style, padded = true, children, ...rest }: Props) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: theme.mode === 'dark' ? 0.28 : 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  padded: {
    padding: 18,
  },
});
