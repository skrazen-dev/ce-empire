import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BankAccount, Expense, Agent, PageId, UsdtCalc, AppSettings, Task, TeamMember, TaskStatus } from './types';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

interface AppState {
  currentPage: PageId;
  setPage: (page: PageId) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  accounts: BankAccount[];
  addAccount: (account: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, data: Partial<BankAccount>) => void;
  deleteAccount: (id: string) => void;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  agents: Agent[];
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt'> | string) => void;
  deleteAgent: (id: string) => void;

  // USDT Calc History
  usdtCalcs: UsdtCalc[];
  addUsdtCalc: (calc: Omit<UsdtCalc, 'id' | 'createdAt'>) => void;
  deleteUsdtCalc: (id: string) => void;
  clearUsdtCalcs: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;

  // Team
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => void;
  deleteTeamMember: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentPage: 'dashboard',
      setPage: (page) => set({ currentPage: page }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      accounts: [],
      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) => a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a),
        })),
      deleteAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

      expenses: [],
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: uid(), createdAt: new Date().toISOString() }],
        })),
      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) => e.id === id ? { ...e, ...data } : e),
        })),
      deleteExpense: (id) =>
        set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

      agents: [],
      addAgent: (agent) => {
        const agentData = typeof agent === 'string' 
          ? { name: agent }
          : agent;
        set((state) => ({
          agents: [...state.agents, { 
            id: uid(), 
            ...agentData,
            withdrawAmount: agentData.withdrawAmount || 0,
            pendingAmount: agentData.pendingAmount || 0,
            startDate: agentData.startDate ? new Date(agentData.startDate).toISOString() : new Date().toISOString(),
            createdAt: new Date().toISOString() 
          }],
        }));
      },
      deleteAgent: (id) =>
        set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),

      // USDT Calc
      usdtCalcs: [],
      addUsdtCalc: (calc) =>
        set((state) => ({
          usdtCalcs: [{ ...calc, id: uid(), createdAt: new Date().toISOString() }, ...state.usdtCalcs].slice(0, 100), // Keep last 100
        })),
      deleteUsdtCalc: (id) =>
        set((state) => ({ usdtCalcs: state.usdtCalcs.filter((c) => c.id !== id) })),
      clearUsdtCalcs: () => set({ usdtCalcs: [] }),

      // Tasks
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: uid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
        })),
      updateTask: (id, data) =>
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t),
        })),
      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t),
        })),

      // Team
      teamMembers: [],
      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [...state.teamMembers, { ...member, id: uid(), createdAt: new Date().toISOString() }],
        })),
      deleteTeamMember: (id) =>
        set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.id !== id) })),

      // Settings
      settings: {
        soundEnabled: true,
        telegramBotToken: '',
        telegramChatId: '',
        notificationThreshold: 5,
        theme: 'dark',
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'ce-empire-data',
      partialize: (state) => ({
        accounts: state.accounts,
        expenses: state.expenses,
        agents: state.agents,
        usdtCalcs: state.usdtCalcs,
        tasks: state.tasks,
        teamMembers: state.teamMembers,
        settings: state.settings,
      }),
    }
  )
);
