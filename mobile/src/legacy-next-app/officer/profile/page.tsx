'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageShell } from '@/components/layout/PageShell';

export default function ProfilePage() {
  const router = useRouter();
  const factoryId = useAuthStore((s) => s.factoryId);
  const role = useAuthStore((s) => s.role);
  const logout = useAuthStore((s) => s.logout);

  const [displayName, setDisplayName] = useState('Factory Officer');
  const [email, setEmail] = useState('officer@spectraleaf.io');
  const [phone, setPhone] = useState('+94 77 555 0142');
  const [shift, setShift] = useState('Day · 06:00–18:00');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSignOut() {
    logout();
    router.push('/login');
  }

  return (
    <PageShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/officer' },
        { label: 'Account' },
        { label: 'Profile' },
      ]}
      title="My Profile"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Identity card */}
        <Card>
          <CardBody className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-accent-primary text-white flex items-center justify-center
              mx-auto mb-4 text-2xl font-bold tracking-tight">
              {factoryId?.slice(0, 2) ?? 'SL'}
            </div>
            <div className="text-[16px] font-semibold text-text-primary">{displayName}</div>
            <div className="text-[13px] text-text-muted mt-0.5">{email}</div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge tone="primary">Factory Officer</Badge>
              <Badge tone="neutral">{factoryId}</Badge>
            </div>
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <Button variant="secondary" className="w-full" size="sm">Change avatar</Button>
              <Button variant="danger" className="w-full" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Personal details form */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader title="Personal Details" subtitle="Visible to your factory team" />
            <CardBody>
              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Display Name" value={displayName} onChange={setDisplayName} />
                <Field label="Email" value={email} onChange={setEmail} type="email" />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Shift" value={shift} onChange={setShift} />
                <Field label="Factory ID" value={factoryId || '—'} onChange={() => {}} disabled mono />
                <Field label="Role" value={role ?? ''} onChange={() => {}} disabled mono />

                <div className="sm:col-span-2 flex items-center justify-between pt-3 border-t border-border">
                  {saved
                    ? <span className="text-[13px] text-[#16A34A]">✓ Saved</span>
                    : <span className="text-[12px] text-text-muted">Changes are saved locally for this demo.</span>}
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Notifications" subtitle="How you want to be reached" />
            <CardBody>
              <ToggleRow
                label="Email alerts"
                description="Sensor anomalies, batch milestones, and weekly summary."
                value={emailAlerts}
                onChange={setEmailAlerts}
              />
              <div className="border-t border-border my-3" />
              <ToggleRow
                label="SMS alerts"
                description="Critical incidents only — temperature out of range."
                value={smsAlerts}
                onChange={setSmsAlerts}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function Field({
  label, value, onChange, type = 'text', disabled = false, mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-10 px-3 border border-border rounded-md text-[13.5px] text-text-primary
          bg-white focus:outline-none focus:border-accent-primary focus:shadow-ring transition-all
          disabled:bg-subtle disabled:text-text-muted ${mono ? 'font-mono' : ''}`}
      />
    </label>
  );
}

function ToggleRow({
  label, description, value, onChange,
}: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <div>
        <div className="text-[13.5px] font-semibold text-text-primary">{label}</div>
        <div className="text-[12px] text-text-muted mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
          value ? 'bg-accent-primary' : 'bg-slate-300'
        }`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: value ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}
