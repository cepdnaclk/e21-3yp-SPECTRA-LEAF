import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BrandMark from '../components/BrandMark';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { AppTheme, useAppTheme } from '../theme';

export default function LoginScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const signIn = useAuthStore(state => state.signIn);
  const loginEmail = useAuthStore(state => state.loginEmail);
  const loginPassword = useAuthStore(state => state.loginPassword);
  const [email, setEmail] = useState(loginEmail);
  const [passcode, setPasscode] = useState(loginPassword);
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEmail(loginEmail);
    setPasscode(loginPassword);
  }, [loginEmail, loginPassword]);

  const submit = () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Enter a valid officer email.');
      return;
    }
    if (passcode.length < 4) {
      setError('Passcode must contain at least four characters.');
      return;
    }
    if (!signIn(cleanEmail, passcode)) {
      setError('Admin email or password is incorrect.');
      return;
    }
    setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={
          theme.mode === 'dark'
            ? ['#06130B', theme.colors.background, '#031008']
            : ['#E0F8E9', theme.colors.background, '#F8FBF8']
        }
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <BrandMark compact />
            <ThemeToggle compact />
          </View>

          <View style={styles.intro}>
            <Text style={styles.kicker}>FERMENTATION OPERATIONS</Text>
            <Text style={styles.title}>Welcome back,{'\n'}officer.</Text>
            <Text style={styles.subtitle}>
              Enter your workspace to monitor live chambers, inspect batches, and complete shift handoffs.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formTop}>
              <View style={styles.formIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.ink} />
              </View>
              <View>
                <Text style={styles.formTitle}>Officer access</Text>
                <Text style={styles.formMeta}>Factory workspace · secure preview</Text>
              </View>
            </View>

            <Text style={styles.label}>ADMIN EMAIL</Text>
            <View style={[styles.inputWrap, error && !email.includes('@') ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="admin@spectraleaf.com"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.label}>PASSWORD</Text>
            <View style={[styles.inputWrap, error && passcode.length < 4 ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />
              <TextInput
                value={passcode}
                onChangeText={setPasscode}
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showPasscode}
                returnKeyType="done"
                onSubmitEditing={submit}
              />
              <Pressable onPress={() => setShowPasscode(current => !current)} hitSlop={10}>
                <Ionicons
                  name={showPasscode ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
            >
              <Text style={styles.submitText}>Enter officer desk</Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.ink} />
            </Pressable>

            <View style={styles.previewNote}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.primaryDark} />
              <Text style={styles.previewText}>
                This build is configured for the assigned officer account.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>LIVE SYSTEM STATUS · READY</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 26 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intro: { marginTop: 48, marginBottom: 26 },
  kicker: { color: theme.colors.primaryDark, fontSize: 9, fontWeight: '900', letterSpacing: 1.7 },
  title: {
    color: theme.colors.text,
    fontSize: 43,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -1.7,
    marginTop: 10,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 19,
    maxWidth: 340,
    marginTop: 13,
  },
  formCard: {
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    shadowColor: '#031008',
    shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  formTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  formIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  formTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
  formMeta: { color: theme.colors.textMuted, fontSize: 9, marginTop: 3 },
  label: {
    color: theme.colors.primaryDark,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
  },
  inputWrap: {
    height: 54,
    borderRadius: 17,
    backgroundColor: theme.colors.elevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 17,
  },
  inputError: { borderColor: theme.colors.danger },
  input: { flex: 1, color: theme.colors.text, fontSize: 13, marginHorizontal: 10 },
  error: { color: theme.colors.dangerText, fontSize: 10, marginTop: -7, marginBottom: 12 },
  submit: {
    height: 56,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 3,
  },
  submitText: { color: theme.colors.ink, fontSize: 13, fontWeight: '900' },
  previewNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 14,
    padding: 11,
  },
  previewText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary },
  footerText: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 1.1, marginLeft: 7 },
  orbOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 34,
    borderColor: theme.mode === 'dark' ? 'rgba(60,242,138,0.07)' : 'rgba(32,200,115,0.08)',
    right: -100,
    top: 90,
  },
  orbTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.mode === 'dark' ? 'rgba(60,242,138,0.04)' : 'rgba(32,200,115,0.06)',
    left: -50,
    bottom: 80,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
