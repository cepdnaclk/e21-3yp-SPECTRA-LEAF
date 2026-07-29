import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { AppTheme, useAppTheme } from '../theme';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: Props) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const textStyles = makeTextStyles(theme);
  const isDisabled = disabled || loading;
  const variantStyle = styles[variant];
  const textStyle = textStyles[variant];
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.ink : theme.colors.primary} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  base: {
    height: 52,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: {
    backgroundColor: theme.colors.elevated,
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
  },
  danger: {
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  text: { fontSize: theme.font.small, fontWeight: '900', letterSpacing: 0.4 },
});

const makeTextStyles = (theme: AppTheme) => StyleSheet.create({
  primary: { color: theme.colors.ink },
  secondary: { color: theme.colors.text },
  danger: { color: theme.colors.danger },
  ghost: { color: theme.colors.primary },
});
