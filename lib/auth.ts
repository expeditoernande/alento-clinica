import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  createSession,
  createUser,
  deleteSession,
  findSessionUser,
  findUserByEmail,
  findUserById,
} from "@/lib/db";
import type { PublicUser, StoredUser } from "@/lib/types";

export const SESSION_COOKIE = "alento_session";
const SESSION_DAYS = 30;
const KEY_LENGTH = 64;

function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, digest] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !digest) return false;
  const key = await derive(password, salt);
  const expected = Buffer.from(digest, "hex");
  if (expected.length !== key.length) return false;
  return timingSafeEqual(key, expected);
}

function toPublic(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

function expiryDate() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password);
  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  const result = await createUser(user);
  if (!result.ok) return { ok: false as const, duplicate: Boolean(result.duplicate) };
  await startSession(user.id);
  return { ok: true as const, user: toPublic(user) };
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return { ok: false as const };
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false as const };
  await startSession(user.id);
  return { ok: true as const, user: toPublic(user) };
}

export async function startSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = expiryDate().toISOString();
  await createSession(token, userId, expiresAt);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function endSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  store.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await findSessionUser(token);
  return user ? toPublic(user) : null;
}

export async function requireUser(): Promise<PublicUser | null> {
  return currentUser();
}

export async function userById(id: string): Promise<PublicUser | null> {
  const user = await findUserById(id);
  return user ? toPublic(user) : null;
}
