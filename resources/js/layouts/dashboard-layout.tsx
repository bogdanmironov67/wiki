import { Toaster } from 'sileo';
import AppFooter from '@/components/app-footer';
import AppNavbar from '@/components/app-navbar';
import WIPBanner from '@/components/wip-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <WIPBanner />
      <AppNavbar />
      <main className="w-full flex-1">
        <div className="space-y-6">{children}</div>
      </main>
      <AppFooter />
      <Toaster theme="light" position="top-right" />
    </div>
  );
}
