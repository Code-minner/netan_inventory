export type ClientStatus = "Ended" | "Ongoing";
export type FormStatus = "pending" | "completed";
export type PaymentStatus = "Completed" | "Not Completed";
export type MemberStatus = "Active" | "Ended" | "Invited";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  servicesCount: number;
  duration: string;
  date: string;
  status: ClientStatus;
  formToken: string;
  formStatus: FormStatus;
  company?: string;
  serviceType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  clientId?: string;
  name: string;
  initials: string;
  servicesCount: number;
  amount: string;
  paidAmount: string;
  paidDate: string;
  status: PaymentStatus;
  createdAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  joined: string;
  status: MemberStatus;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  text: string;
  time: string;
  unread: boolean;
  dateGroup: string;
  createdAt: string;
};

export type AppStore = {
  clients: Client[];
  payments: Payment[];
  team: TeamMember[];
  notifications: NotificationItem[];
};
