import { promises as fs } from "fs";
import path from "path";
import type { AppStore, Client, NotificationItem, Payment, TeamMember } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function seedStore(): AppStore {
  const now = new Date().toISOString();
  const clients: Client[] = [
    {
      id: "1",
      name: "Tolu & Kene Studio",
      email: "hello@tolukene.studio",
      phone: "+234 803 000 1111",
      initials: "TK",
      servicesCount: 2,
      duration: "1 Month",
      date: "Mar 14, 2026",
      status: "Ended",
      formToken: "seed-token-1",
      formStatus: "completed",
      company: "Tolu & Kene Studio",
      serviceType: "Design & Branding",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "2",
      name: "iDesign Space",
      email: "team@idesign.space",
      phone: "+234 802 222 3333",
      initials: "IS",
      servicesCount: 2,
      duration: "3 Months",
      date: "Mar 14, 2026",
      status: "Ongoing",
      formToken: "seed-token-2",
      formStatus: "completed",
      company: "iDesign Space",
      serviceType: "Cloud Services",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "3",
      name: "Pinnacle Health",
      email: "ops@pinnacle.health",
      phone: "+234 701 444 5555",
      initials: "PH",
      servicesCount: 1,
      duration: "1 Month",
      date: "Mar 10, 2026",
      status: "Ended",
      formToken: "seed-token-3",
      formStatus: "completed",
      company: "Pinnacle Health",
      serviceType: "UI/UX Design",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const payments: Payment[] = [
    {
      id: "1",
      clientId: "1",
      name: "Tolu & Kene Studio",
      initials: "TK",
      servicesCount: 2,
      amount: "₦1,200,000",
      paidAmount: "₦1,200,000",
      paidDate: "Mar 6, 2026",
      status: "Completed",
      createdAt: now,
    },
    {
      id: "2",
      clientId: "2",
      name: "iDesign Space",
      initials: "IS",
      servicesCount: 2,
      amount: "₦1,200,000",
      paidAmount: "₦800,000",
      paidDate: "Mar 6, 2026",
      status: "Not Completed",
      createdAt: now,
    },
  ];

  const team: TeamMember[] = [
    {
      id: "1",
      name: "Adaeze Okonkwo",
      initials: "AO",
      email: "adaeze@netan.tech",
      role: "Admin",
      joined: "Jan 12, 2026",
      status: "Active",
      createdAt: now,
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: "n1",
      text: "A new client, Tastytreat, was added.",
      time: "13 December 2025 • 9:23AM",
      unread: true,
      dateGroup: "13 December 2025",
      createdAt: now,
    },
    {
      id: "n2",
      text: "Alibaba Kazeem's information was updated.",
      time: "13 December 2025 • 9:23AM",
      unread: true,
      dateGroup: "13 December 2025",
      createdAt: now,
    },
    {
      id: "n3",
      text: "A payment of ₦150,000 was recorded for PrimeTouch.",
      time: "13 December 2025 • 9:23AM",
      unread: true,
      dateGroup: "13 December 2025",
      createdAt: now,
    },
  ];

  return { clients, payments, team, notifications };
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readStore(): Promise<AppStore> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as AppStore;
  } catch {
    const seeded = seedStore();
    await writeStore(seeded);
    return seeded;
  }
}

export async function writeStore(store: AppStore): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
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
