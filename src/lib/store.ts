import { supabaseRest } from "./supabase";
import type {
  Client,
  NotificationItem,
  Payment,
  TeamMember,
} from "./types";

type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  services_count: number;
  duration: string;
  date: string;
  status: Client["status"];
  form_token: string;
  form_status: Client["formStatus"];
  company: string | null;
  service_type: string | null;
  notes: string | null;
  project_name: string | null;
  project_description: string | null;
  budget: string | null;
  goals: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  client_id: string | null;
  name: string;
  initials: string;
  services_count: number;
  amount: string;
  paid_amount: string;
  paid_date: string;
  status: Payment["status"];
  created_at: string;
};

type TeamRow = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  joined: string;
  status: TeamMember["status"];
  auth_user_id: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  reset_token: string | null;
  reset_expires_at: string | null;
  avatar_url: string | null;
  notify_client: boolean | null;
  notify_payment: boolean | null;
  notify_service: boolean | null;
  notify_team: boolean | null;
  notify_system: boolean | null;
  created_at: string;
};

type NotificationRow = {
  id: string;
  text: string;
  time: string;
  unread: boolean;
  date_group: string;
  created_at: string;
};

function firstRow<T>(data: T | T[] | null): T {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Database did not return the saved row.");
  return row;
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createToken() {
  return `frm_${createId()}`;
}

export function makeInitials(name: string) {
  return initialsFrom(name) || "NA";
}

export function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatNotificationTime(date = new Date()) {
  const dateGroup = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return {
    dateGroup,
    time: `${dateGroup} • ${time}`,
  };
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    initials: row.initials,
    servicesCount: row.services_count,
    duration: row.duration,
    date: row.date,
    status: row.status,
    formToken: row.form_token,
    formStatus: row.form_status,
    company: row.company || undefined,
    serviceType: row.service_type || undefined,
    notes: row.notes || undefined,
    projectName: row.project_name || undefined,
    projectDescription: row.project_description || undefined,
    budget: row.budget || undefined,
    goals: row.goals || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    clientId: row.client_id || undefined,
    name: row.name,
    initials: row.initials,
    servicesCount: row.services_count,
    amount: row.amount,
    paidAmount: row.paid_amount,
    paidDate: row.paid_date,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapTeam(row: TeamRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    email: row.email,
    role: row.role,
    joined: row.joined,
    status: row.status,
    authUserId: row.auth_user_id || undefined,
    inviteToken: row.invite_token || undefined,
    inviteExpiresAt: row.invite_expires_at || undefined,
    resetToken: row.reset_token || undefined,
    resetExpiresAt: row.reset_expires_at || undefined,
    avatarUrl: row.avatar_url || undefined,
    notifyClient: row.notify_client !== false,
    notifyPayment: row.notify_payment !== false,
    notifyService: row.notify_service !== false,
    notifyTeam: row.notify_team !== false,
    notifySystem: row.notify_system === true,
    createdAt: row.created_at,
  };
}

function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    text: row.text,
    time: row.time,
    unread: row.unread,
    dateGroup: row.date_group,
    createdAt: row.created_at,
  };
}

export async function listClients() {
  const rows = await supabaseRest<ClientRow[]>(
    "/clients?select=*&order=created_at.desc",
  );
  return rows.map(mapClient);
}

export async function getClientById(id: string) {
  const rows = await supabaseRest<ClientRow[]>(
    `/clients?id=eq.${encodeURIComponent(id)}&select=*`,
  );
  return rows[0] ? mapClient(rows[0]) : null;
}

export async function getClientByToken(token: string) {
  const rows = await supabaseRest<ClientRow[]>(
    `/clients?form_token=eq.${encodeURIComponent(token)}&select=*`,
  );
  return rows[0] ? mapClient(rows[0]) : null;
}

export async function insertClient(client: Client) {
  const rows = await supabaseRest<ClientRow[]>("/clients", {
    method: "POST",
    body: JSON.stringify({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      initials: client.initials,
      services_count: client.servicesCount,
      duration: client.duration,
      date: client.date,
      status: client.status,
      form_token: client.formToken,
      form_status: client.formStatus,
      company: client.company ?? null,
      service_type: client.serviceType ?? null,
      notes: client.notes ?? null,
      project_name: client.projectName ?? null,
      project_description: client.projectDescription ?? null,
      budget: client.budget ?? null,
      goals: client.goals ?? null,
      created_at: client.createdAt,
      updated_at: client.updatedAt,
    }),
  });
  return mapClient(firstRow(rows));
}

export async function updateClient(id: string, patch: Partial<Client>) {
  const body: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.phone !== undefined) body.phone = patch.phone;
  if (patch.initials !== undefined) body.initials = patch.initials;
  if (patch.servicesCount !== undefined) body.services_count = patch.servicesCount;
  if (patch.duration !== undefined) body.duration = patch.duration;
  if (patch.date !== undefined) body.date = patch.date;
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.formStatus !== undefined) body.form_status = patch.formStatus;
  if (patch.company !== undefined) body.company = patch.company;
  if (patch.serviceType !== undefined) body.service_type = patch.serviceType;
  if (patch.notes !== undefined) body.notes = patch.notes;
  if (patch.projectName !== undefined) body.project_name = patch.projectName;
  if (patch.projectDescription !== undefined) {
    body.project_description = patch.projectDescription;
  }
  if (patch.budget !== undefined) body.budget = patch.budget;
  if (patch.goals !== undefined) body.goals = patch.goals;

  const rows = await supabaseRest<ClientRow[]>(
    `/clients?id=eq.${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
  return rows[0] ? mapClient(rows[0]) : null;
}

export async function deleteClient(id: string) {
  await supabaseRest(`/clients?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function listPayments() {
  const rows = await supabaseRest<PaymentRow[]>(
    "/payments?select=*&order=created_at.desc",
  );
  return rows.map(mapPayment);
}

export async function insertPayment(payment: Payment) {
  const rows = await supabaseRest<PaymentRow[]>("/payments", {
    method: "POST",
    body: JSON.stringify({
      id: payment.id,
      client_id: payment.clientId ?? null,
      name: payment.name,
      initials: payment.initials,
      services_count: payment.servicesCount,
      amount: payment.amount,
      paid_amount: payment.paidAmount,
      paid_date: payment.paidDate,
      status: payment.status,
      created_at: payment.createdAt,
    }),
  });
  return mapPayment(firstRow(rows));
}

export async function listTeam() {
  const rows = await supabaseRest<TeamRow[]>(
    "/team?select=*&order=created_at.desc",
  );
  return rows.map(mapTeam);
}

export async function findTeamByEmail(email: string) {
  const rows = await supabaseRest<TeamRow[]>(
    `/team?email=eq.${encodeURIComponent(email)}&select=*`,
  );
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function insertTeamMember(member: TeamMember) {
  const rows = await supabaseRest<TeamRow[]>("/team", {
    method: "POST",
    body: JSON.stringify({
      id: member.id,
      name: member.name,
      initials: member.initials,
      email: member.email,
      role: member.role,
      joined: member.joined,
      status: member.status,
      auth_user_id: member.authUserId ?? null,
      invite_token: member.inviteToken ?? null,
      invite_expires_at: member.inviteExpiresAt ?? null,
      reset_token: member.resetToken ?? null,
      reset_expires_at: member.resetExpiresAt ?? null,
      avatar_url: member.avatarUrl ?? null,
      notify_client: member.notifyClient,
      notify_payment: member.notifyPayment,
      notify_service: member.notifyService,
      notify_team: member.notifyTeam,
      notify_system: member.notifySystem,
      created_at: member.createdAt,
    }),
  });
  return mapTeam(firstRow(rows));
}

export async function findTeamByAuthUserId(authUserId: string) {
  const rows = await supabaseRest<TeamRow[]>(
    `/team?auth_user_id=eq.${encodeURIComponent(authUserId)}&select=*`,
  );
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function findTeamByInviteToken(token: string) {
  const rows = await supabaseRest<TeamRow[]>(
    `/team?invite_token=eq.${encodeURIComponent(token)}&select=*`,
  );
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function findTeamByResetToken(token: string) {
  const rows = await supabaseRest<TeamRow[]>(
    `/team?reset_token=eq.${encodeURIComponent(token)}&select=*`,
  );
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function hasActiveAdmin() {
  const rows = await supabaseRest<TeamRow[]>(
    "/team?status=eq.Active&auth_user_id=not.is.null&select=id",
  );
  return rows.length > 0;
}

export async function updateTeamMember(id: string, patch: Partial<TeamMember>) {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.initials !== undefined) body.initials = patch.initials;
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.role !== undefined) body.role = patch.role;
  if (patch.status !== undefined) body.status = patch.status;
  if (patch.authUserId !== undefined) body.auth_user_id = patch.authUserId || null;
  if (patch.inviteToken !== undefined) body.invite_token = patch.inviteToken || null;
  if (patch.inviteExpiresAt !== undefined) {
    body.invite_expires_at = patch.inviteExpiresAt || null;
  }
  if (patch.resetToken !== undefined) body.reset_token = patch.resetToken || null;
  if (patch.resetExpiresAt !== undefined) {
    body.reset_expires_at = patch.resetExpiresAt || null;
  }
  if (patch.avatarUrl !== undefined) body.avatar_url = patch.avatarUrl || null;
  if (patch.notifyClient !== undefined) body.notify_client = patch.notifyClient;
  if (patch.notifyPayment !== undefined) body.notify_payment = patch.notifyPayment;
  if (patch.notifyService !== undefined) body.notify_service = patch.notifyService;
  if (patch.notifyTeam !== undefined) body.notify_team = patch.notifyTeam;
  if (patch.notifySystem !== undefined) body.notify_system = patch.notifySystem;

  const rows = await supabaseRest<TeamRow[]>(
    `/team?id=eq.${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function listNotifications() {
  const rows = await supabaseRest<NotificationRow[]>(
    "/notifications?select=*&order=created_at.desc",
  );
  return rows.map(mapNotification);
}

export async function insertNotification(item: NotificationItem) {
  const rows = await supabaseRest<NotificationRow[]>("/notifications", {
    method: "POST",
    body: JSON.stringify({
      id: item.id,
      text: item.text,
      time: item.time,
      unread: item.unread,
      date_group: item.dateGroup,
      created_at: item.createdAt,
    }),
  });
  return mapNotification(firstRow(rows));
}

export async function markAllNotificationsRead() {
  await supabaseRest("/notifications?unread=eq.true", {
    method: "PATCH",
    body: JSON.stringify({ unread: false }),
  });
  return listNotifications();
}
