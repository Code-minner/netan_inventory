import { BANK_DETAILS } from "./bank-details";
import {
  SERVICE_CATALOG,
  type CatalogService,
} from "./services-catalog";

export type BrandingSettings = {
  navLogoUrl: string;
  dashboardLogoUrl: string;
  faviconUrl: string;
};

export type BankSettings = {
  paymentMethod: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export type AppSettings = {
  branding: BrandingSettings;
  bank: BankSettings;
  services: CatalogService[];
};

const DEFAULT_LOGO = "/assets/logo.png";

export const DEFAULT_BRANDING: BrandingSettings = {
  navLogoUrl: DEFAULT_LOGO,
  dashboardLogoUrl: DEFAULT_LOGO,
  faviconUrl: DEFAULT_LOGO,
};

export const DEFAULT_BANK: BankSettings = {
  paymentMethod: BANK_DETAILS.paymentMethod,
  accountName: BANK_DETAILS.accountName,
  accountNumber: BANK_DETAILS.accountNumber,
  bankName: BANK_DETAILS.bankName,
};

export const DEFAULT_SERVICES: CatalogService[] = SERVICE_CATALOG.map(
  (service) => ({ ...service }),
);
