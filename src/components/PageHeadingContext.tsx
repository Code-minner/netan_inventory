"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Breadcrumb = {
  parentLabel: string;
  parentHref: string;
  current: string;
} | null;

type PageHeadingValue = {
  breadcrumb: Breadcrumb;
  setBreadcrumb: (value: Breadcrumb) => void;
};

const PageHeadingContext = createContext<PageHeadingValue | null>(null);

export function PageHeadingProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<Breadcrumb>(null);
  const value = useMemo(
    () => ({ breadcrumb, setBreadcrumb }),
    [breadcrumb],
  );
  return (
    <PageHeadingContext.Provider value={value}>
      {children}
    </PageHeadingContext.Provider>
  );
}

export function useSetPageBreadcrumb(value: Breadcrumb) {
  const setBreadcrumb = useContext(PageHeadingContext)?.setBreadcrumb;
  const parentLabel = value?.parentLabel ?? "";
  const parentHref = value?.parentHref ?? "";
  const current = value?.current ?? "";

  useEffect(() => {
    if (!setBreadcrumb) return;
    if (!parentLabel || !current) {
      setBreadcrumb(null);
      return;
    }
    setBreadcrumb({ parentLabel, parentHref, current });
    return () => setBreadcrumb(null);
  }, [setBreadcrumb, parentLabel, parentHref, current]);
}

export function usePageHeading() {
  return useContext(PageHeadingContext);
}
