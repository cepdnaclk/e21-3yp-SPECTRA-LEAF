import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import { useAuthStore } from '../store/authStore';
import { AppTheme, useAppTheme } from '../theme';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  const profile = useAuthStore(state => state.profile);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const signOut = useAuthStore(state => state.signOut);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const startEditing = () => {
    setForm(profile);
    setEditing(true);
  };

  const save = () => {
    updateProfile(form);
    setEditing(false);
    Alert.alert('Profile saved', 'Your local officer details were updated.');
  };

  const confirmSignOut = () => {
    Alert.alert('End officer session?', 'You will return to the SpectraLeaf login screen.', [
      { text: 'Stay signed in', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>OFFICER SETTINGS</Text>
            <Text style={styles.title}>Your workspace</Text>
          </View>
          <Pressable onPress={startEditing} style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <View style={styles.identityPattern} />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile.displayName
                .split(' ')
                .map(part => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          <Badge label="Officer mode" variant="live" />
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.role}>Factory Officer · {profile.factoryId}</Text>
          <View style={styles.shiftTag}>
            <Ionicons name="time-outline" size={14} color="#031008" />
            <Text style={styles.shiftText}>{profile.shift}</Text>
          </View>
        </View>

        <View style={styles.modeNotice}>
          <View style={styles.modeIcon}>
            <Ionicons name="key-outline" size={19} color={theme.colors.primary} />
          </View>
          <View style={styles.modeCopy}>
            <Text style={styles.modeTitle}>Officer session active</Text>
            <Text style={styles.modeText}>
              Local preview validation is enabled. Production authentication can be connected later.
            </Text>
          </View>
        </View>

        <SectionHeader kicker="IDENTITY" title={editing ? 'Edit officer details' : 'Officer details'} />
        <Card style={styles.detailsCard}>
          <ProfileField
            icon="person-outline"
            label="DISPLAY NAME"
            value={editing ? form.displayName : profile.displayName}
            editing={editing}
            onChangeText={value => setForm({ ...form, displayName: value })}
          />
          <ProfileField
            icon="mail-outline"
            label="EMAIL"
            value={editing ? form.email : profile.email}
            editing={editing}
            onChangeText={value => setForm({ ...form, email: value })}
          />
          <ProfileField
            icon="call-outline"
            label="PHONE"
            value={editing ? form.phone : profile.phone}
            editing={editing}
            onChangeText={value => setForm({ ...form, phone: value })}
          />
          <ProfileField
            icon="time-outline"
            label="SHIFT"
            value={editing ? form.shift : profile.shift}
            editing={editing}
            onChangeText={value => setForm({ ...form, shift: value })}
          />
          <ProfileField
            icon="business-outline"
            label="FACTORY"
            value={editing ? form.factoryId : profile.factoryId}
            editing={editing}
            onChangeText={value => setForm({ ...form, factoryId: value.toUpperCase() })}
            last
          />

          {editing ? (
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setEditing(false)}
                style={styles.actionButton}
              />
              <Button title="Save details" onPress={save} style={styles.actionButton} />
            </View>
          ) : null}
        </Card>

        <SectionHeader kicker="SHIFT PREFERENCES" title="How the app behaves" />
        <Card style={styles.preferenceCard}>
          <PreferenceRow
            icon="notifications-outline"
            title="Live state alerts"
            description="Surface start and stop changes from other devices."
            value={liveAlerts}
            onChange={setLiveAlerts}
          />
          <PreferenceRow
            icon="sync-outline"
            title="Automatic refresh"
            description="Keep sensors and batch state synchronized."
            value={autoRefresh}
            onChange={setAutoRefresh}
            last
          />
        </Card>

        <SectionHeader kicker="APPEARANCE" title="Choose your workspace theme" />
        <Card style={styles.themeCard}>
          <View style={styles.themeCopy}>
            <Text style={styles.preferenceTitle}>
              {theme.mode === 'dark' ? 'Dark control room' : 'Light work floor'}
            </Text>
            <Text style={styles.preferenceText}>
              Switch the complete mobile interface between dark and light.
            </Text>
          </View>
          <ThemeToggle />
        </Card>

        <Button title="Sign out of officer desk" variant="secondary" onPress={confirmSignOut} />

        <View style={styles.versionRow}>
          <View style={styles.versionMark}>
            <Ionicons name="leaf" size={16} color="#031008" />
          </View>
          <View>
            <Text style={styles.versionName}>SpectraLeaf Officer</Text>
            <Text style={styles.versionMeta}>Mobile workspace · version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionKicker}>{kicker}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ProfileField({
  icon,
  label,
  value,
  editing,
  onChangeText,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  editing: boolean;
  onChangeText: (value: string) => void;
  last?: boolean;
}) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={[styles.field, !last && styles.fieldBorder]}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={17} color={theme.colors.primary} />
      </View>
      <View style={styles.fieldCopy}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="none"
            placeholderTextColor={theme.colors.textMuted}
          />
        ) : (
          <Text style={styles.fieldValue}>{value}</Text>
        )}
      </View>
    </View>
  );
}

function PreferenceRow({
  icon,
  title,
  description,
  value,
  onChange,
  last,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  const theme = useAppTheme();
  const styles = makeStyles(theme);
  return (
    <View style={[styles.preferenceRow, !last && styles.fieldBorder]}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={17} color={theme.colors.primary} />
      </View>
      <View style={styles.preferenceCopy}>
        <Text style={styles.preferenceTitle}>{title}</Text>
        <Text style={styles.preferenceText}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.colors.borderActive, true: '#1C7A45' }}
        thumbColor={value ? theme.colors.primary : theme.colors.textMuted}
      />
    </View>
  );
}

const makeStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  kicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 4 },
  editButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderActive,
  },
  identity: {
    minHeight: 285,
    borderRadius: 30,
    backgroundColor: '#F7FFF9',
    padding: 20,
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  identityPattern: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 34,
    borderColor: 'rgba(60,242,138,0.18)',
    right: -90,
    top: -82,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#031008',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: theme.colors.primary, fontSize: 21, fontWeight: '900' },
  name: { color: '#031008', fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 18 },
  role: { color: '#3F5647', fontSize: 12, fontWeight: '700', marginTop: 4 },
  shiftTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 20,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  shiftText: { color: '#031008', fontSize: 10, fontWeight: '900' },
  modeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 15,
    marginTop: 12,
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeCopy: { flex: 1, marginLeft: 12 },
  modeTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900' },
  modeText: { color: theme.colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  sectionHeader: { marginTop: 30, marginBottom: 13 },
  sectionKicker: { color: theme.colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  sectionTitle: { color: theme.colors.text, fontSize: 21, fontWeight: '900', marginTop: 4 },
  detailsCard: { paddingVertical: 5, borderRadius: 24 },
  field: { minHeight: 66, flexDirection: 'row', alignItems: 'center' },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCopy: { flex: 1, marginLeft: 11 },
  fieldLabel: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  fieldValue: { color: theme.colors.text, fontSize: 13, fontWeight: '800', marginTop: 4 },
  input: {
    height: 38,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    paddingVertical: 0,
  },
  editActions: { flexDirection: 'row', gap: 9, marginTop: 16, marginBottom: 10 },
  actionButton: { flex: 1 },
  preferenceCard: { paddingVertical: 5, borderRadius: 24 },
  preferenceRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center' },
  preferenceCopy: { flex: 1, marginHorizontal: 11 },
  preferenceTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '900' },
  preferenceText: { color: theme.colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    marginBottom: 12,
  },
  themeCopy: { flex: 1, marginRight: 14 },
  versionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 28, paddingHorizontal: 4 },
  versionMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  versionName: { color: theme.colors.text, fontSize: 12, fontWeight: '900' },
  versionMeta: { color: theme.colors.textMuted, fontSize: 9, marginTop: 3 },
  bottomSpace: { height: 116 },
});
