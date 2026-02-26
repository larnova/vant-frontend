import { AccountModeProvider } from "@/contexts/account-mode";
import { DemoModeProvider } from "@/contexts/demo-mode";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoModeProvider>
      <AccountModeProvider>{children}</AccountModeProvider>
    </DemoModeProvider>
  );
}
