import { NextResponse } from "next/server";
import { readStore, writeStore } from "@/src/lib/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const store = await readStore();
  const client = store.clients.find((c) => c.id === id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json({ client });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const store = await readStore();
  const index = store.clients.findIndex((c) => c.id === id);
  if (index < 0) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const current = store.clients[index];
  store.clients[index] = {
    ...current,
    ...body,
    id: current.id,
    formToken: current.formToken,
    updatedAt: new Date().toISOString(),
  };

  await writeStore(store);
  return NextResponse.json({ client: store.clients[index] });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const store = await readStore();
  store.clients = store.clients.filter((c) => c.id !== id);
  await writeStore(store);
  return NextResponse.json({ ok: true });
}
