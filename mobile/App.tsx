// Must be first import for gesture handler web support
import 'react-native-gesture-handler';

import React, { Component, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import RootNavigator from './src/navigation/AppNavigator';
import { useAppTheme } from './src/theme';

interface EState { hasError: boolean; msg: string }
class ErrorBoundary extends Component<{ children: ReactNode }, EState> {
  state: EState = { hasError: false, msg: '' };
  static getDerivedStateFromError(e: Error): EState {
    return { hasError: true, msg: e.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={eb.wrap}>
          <Text style={eb.title}>Startup error</Text>
          <Text style={eb.msg}>{this.state.msg}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#b91c1c', marginBottom: 8 },
  msg:  { fontSize: 13, color: '#555', textAlign: 'center' },
});

export default function App() {
  const theme = useAppTheme();
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
          <RootNavigator />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
