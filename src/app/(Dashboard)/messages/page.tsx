import { Suspense } from "react";
import MessagesInbox from "./components/MessagesInbox";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-gray-500 p-4">Loading messages…</p>
      }
    >
      <MessagesInbox />
    </Suspense>
  );
}
