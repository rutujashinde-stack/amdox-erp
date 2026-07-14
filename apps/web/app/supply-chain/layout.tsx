import AppShell from '../../components/layout/AppShell';

export default function SupplyChainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}