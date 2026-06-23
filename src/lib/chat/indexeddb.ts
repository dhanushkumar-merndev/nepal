"use client";

import { openDB } from "idb";
import type { ChatSession } from "@/lib/chat/types";

const DB_NAME = "ott-nepal-chat";
const STORE = "sessions";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    },
  });
}

export async function getSessions() {
  const db = await getDb();
  const sessions = await db.getAll(STORE);
  return (sessions as ChatSession[]).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function saveSession(session: ChatSession) {
  const db = await getDb();
  await db.put(STORE, session);
}

export async function deleteSession(id: string) {
  const db = await getDb();
  await db.delete(STORE, id);
}

export async function clearSessions() {
  const db = await getDb();
  await db.clear(STORE);
}
