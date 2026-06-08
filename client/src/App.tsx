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
import { useState } from "react";

function PageRenderer() {
  const { currentPage } = useStore();
  switch (currentPage) {
    case 'dashboard': return <DashboardPage />;
    case 'accounts': return <AccountsPage />;
    case 'expenses': return <ExpensesPage />;
    case 'agents': return <AgentsPage />;
    case 'status': return <StatusPage />;
    case 'proof': return <ProofPage />;
    case 'usdt-calc': return <UsdtCalcPage />;
    case 'bulk-calc': return <BulkCalcPage />;
    case 'risk-analysis': return <RiskAnalysisPage />;
    case 'tasks': return <TasksPage />;

    case 'settings': return <SettingsPage />;
    default: return <DashboardPage />;
  }
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
