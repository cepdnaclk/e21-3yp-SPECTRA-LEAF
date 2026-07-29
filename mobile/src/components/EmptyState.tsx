import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, useAppTheme } from '../theme';

interface Props {
  title: string;
  message?: string;
}

export default function EmptyState({ title, message }: Props) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name="leaf-outline" size={20} color={theme.colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  wrap: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '900',
    marginBottom: theme.spacing.xs,
  },
  msg: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    textAlign: 'center',
    lineHeight: 19,
  },
});
