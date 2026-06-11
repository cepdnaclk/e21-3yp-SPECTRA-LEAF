import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface Props {
  title: string;
  message?: string;
}

export default function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
