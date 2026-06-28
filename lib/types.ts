export type TransactionType = "income" | "expense";

export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "entertainment"
  | "health"
  | "salary"
  | "freelance"
  | "investment"
  | "other";

export type BankAccountType = "bank" | "ewallet" | "cash";

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  type: BankAccountType;
  accountNumber?: string;
  balance: number;
  color: string;
  logo: string;
  gradient: [string, string];
}

export interface BankPreset {
  id: string;
  name: string;
  fullName: string;
  type: BankAccountType;
  color: string;
  logo: string;
  gradient: [string, string];
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  notes?: string;
  bankAccountId: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryExpense {
  category: Category;
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface BudgetItem {
  category: Category;
  label: string;
  spent: number;
  limit: number;
  color: string;
}

export interface Insight {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  message: string;
  icon: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  emoji: string;
}

export interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: Category;
  emoji: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  balanceGrowth: number;
  incomeGrowth: number;
  expenseGrowth: number;
  savingsRate: number;
}

export interface TransactionFormValues {
  amount: number;
  type: TransactionType;
  category: Category;
  name: string;
  date: string;
  notes?: string;
  bankAccountId: string;
}
