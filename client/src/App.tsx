import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SoundProvider } from "./contexts/SoundContext";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import DashboardPage from "@/pages/DashboardPage";
import AccountsPage from "@/pages/AccountsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import AgentsPage from "@/pages/AgentsPage";
import StatusPage from "@/pages/StatusPage";
import ProofPage from "@/pages/ProofPage";
import UsdtCalcPage from "@/pages/UsdtCalcPage";
import SettingsPage from "@/pages/SettingsPage";
import BulkCalcPage from "@/pages/BulkCalcPage";
import RiskAnalysisPage from "@/pages/RiskAnalysisPage";
import TasksPage from "@/pages/TasksPage";

import LoadingScreen from "@/components/LoadingScreen";
import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";

function PageRenderer() {
  const { currentPage } = useStore();
  let content: React.ReactNode;
  switch (currentPage) {
    case 'dashboard': content = <DashboardPage />; break;
    case 'accounts': content = <AccountsPage />; break;
    case 'expenses': content = <ExpensesPage />; break;
    case 'agents': content = <AgentsPage />; break;
    case 'status': content = <StatusPage />; break;
    case 'proof': content = <ProofPage />; break;
    case 'usdt-calc': content = <UsdtCalcPage />; break;
    case 'bulk-calc': content = <BulkCalcPage />; break;
    case 'risk-analysis': content = <RiskAnalysisPage />; break;
    case 'tasks': content = <TasksPage />; break;
    case 'settings': content = <SettingsPage />; break;
    default: content = <DashboardPage />;
  }
  return <PageTransition pageKey={currentPage}>{content}</PageTransition>;
}
function AppLayout() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="min-h-screen bg-[#0F1419]">
      <TopBar />
      <div className="flex max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        <Sidebar />
        <main className="flex-1 py-4 lg:pl-4 min-w-0 pb-20 lg:pb-4">
          <PageRenderer />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <SoundProvider>
          <TooltipProvider>
            <Toaster />
            {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
            <div className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
              <AppLayout />
            </div>
          </TooltipProvider>
        </SoundProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
