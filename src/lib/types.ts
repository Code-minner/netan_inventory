export type ClientStatus = "Ended" | "Ongoing";
export type FormStatus = "pending" | "completed";
export type PaymentStatus = "Completed" | "Not Completed";
export type MemberStatus = "Active" | "Ended" | "Invited";

export type SelectedService = {
  id: string;
  title: string;
  price: number;
};

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
  projectName?: string;
  projectDescription?: string;
  budget?: string;
  goals?: string;
  selectedServices?: SelectedService[];
  timeline?: string;
  projectDocumentUrl?: string;
  aboutProject?: string;
  paymentPercent?: number;
  paymentProofUrl?: string;
  orderTotal?: string;
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
  paymentPercent?: number;
  paymentProofUrl?: string;
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
  authUserId?: string;
  inviteToken?: string;
  inviteExpiresAt?: string;
  resetToken?: string;
  resetExpiresAt?: string;
  avatarUrl?: string;
  notifyClient: boolean;
  notifyPayment: boolean;
  notifyService: boolean;
  notifyTeam: boolean;
  notifySystem: boolean;
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
