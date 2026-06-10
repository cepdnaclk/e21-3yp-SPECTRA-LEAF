'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export default function GMLayout({ children }: { children: React.ReactNode }) {
  const { role, hydrated } = useAuth('GENERAL_MANAGER');
  if (!hydrated || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar role="GENERAL_MANAGER" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
