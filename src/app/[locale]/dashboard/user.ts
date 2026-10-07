export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  unreadNotifications: number;
  unreadMessages: number;
};

export type OverviewStats = {
  upcomingAppointments: number;
  savedProviders: number;
  walletBalance: number;
  serviceRequests: number;
};

// TODO (backend): delete these mocks and fetch real data
export const mockUser: DashboardUser = {
  id: "1",
  name: "Maryam",
  email: "maryam@example.com",
  unreadNotifications: 2,
  unreadMessages: 3,
};

export const mockStats: OverviewStats = {
  upcomingAppointments: 0,
  savedProviders: 0,
  walletBalance: 0,
  serviceRequests: 0,
};