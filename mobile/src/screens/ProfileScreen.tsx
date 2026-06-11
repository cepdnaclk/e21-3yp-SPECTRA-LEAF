import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

export default function ProfileScreen() {
  const profile = useAuthStore(s => s.profile);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const signOut = useAuthStore(s => s.signOut);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);

  const onSave = () => {
    updateProfile(form);
    setEditing(false);
    Alert.alert('Saved', 'Profile updated.');
  };

  const onCancel = () => {
    setForm(profile);
    setEditing(false);
  };

  const onSignOut = () => {
    signOut();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.muted}>{profile.email}</Text>
            <View style={{ marginTop: 6, flexDirection: 'row', gap: 6 }}>
              <Badge label={profile.role} variant="completed" />
              <Badge label={profile.factoryId} variant="priced" />
            </View>
          </View>
        </View>
      </Card>

      <Text style={styles.section}>Officer Details</Text>
      <Card>
        <Field
          label="Display Name"
          value={editing ? form.displayName : profile.displayName}
          editing={editing}
          onChangeText={t => setForm({ ...form, displayName: t })}
        />
        <Field
          label="Email"
          value={editing ? form.email : profile.email}
          editing={editing}
          onChangeText={t => setForm({ ...form, email: t })}
          keyboardType="email-address"
        />
        <Field
          label="Phone"
          value={editing ? form.phone : profile.phone}
          editing={editing}
          onChangeText={t => setForm({ ...form, phone: t })}
          keyboardType="phone-pad"
        />
        <Field
          label="Shift"
          value={editing ? form.shift : profile.shift}
          editing={editing}
          onChangeText={t => setForm({ ...form, shift: t })}
        />
        <Field
          label="Factory ID"
          value={editing ? form.factoryId : profile.factoryId}
          editing={editing}
          onChangeText={t => setForm({ ...form, factoryId: t.toUpperCase() })}
        />
        <Field label="Role" value={profile.role} editing={false} />

        {editing ? (
          <View style={[styles.row, { marginTop: theme.spacing.lg }]}>
            <View style={{ flex: 1 }}>
              <Button title="Cancel" variant="secondary" onPress={onCancel} />
            </View>
            <View style={{ width: theme.spacing.md }} />
            <View style={{ flex: 1 }}>
              <Button title="Save" onPress={onSave} />
            </View>
          </View>
        ) : (
          <Button
            title="Edit Profile"
            variant="secondary"
            onPress={() => {
              setForm(profile);
              setEditing(true);
            }}
            style={{ marginTop: theme.spacing.lg }}
          />
        )}
      </Card>

      <View style={{ height: theme.spacing.xl }} />
      <Button title="Sign Out" variant="danger" onPress={onSignOut} />
      <View style={{ height: theme.spacing.xxl }} />
    </ScrollView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChangeText?: (t: string) => void;
  keyboardType?: any;
}

function Field({ label, value, editing, onChangeText, keyboardType }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editing && onChangeText ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={theme.colors.textMuted}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 132,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  profileCard: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primaryBorder,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '900', color: theme.colors.text },
  muted: { color: theme.colors.textMuted, fontSize: theme.font.small, lineHeight: 19 },
  section: {
    fontSize: theme.font.h3,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  row: { flexDirection: 'row' },
  field: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  fieldLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.font.small,
    marginBottom: 4,
    fontWeight: '600',
  },
  fieldValue: { color: theme.colors.text, fontSize: theme.font.body },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceSoft,
  },
});
