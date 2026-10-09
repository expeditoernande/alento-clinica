import { Pool } from "pg";
import type {
  StoredApplication,
  StoredAppointment,
  StoredUser,
  StorageKind,
} from "@/lib/types";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS al_users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS al_users_email_key ON al_users (lower(email));

CREATE TABLE IF NOT EXISTS al_sessions (
  token text PRIMARY KEY,
  user_id text NOT NULL REFERENCES al_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS al_sessions_user_idx ON al_sessions (user_id);

CREATE TABLE IF NOT EXISTS al_appointments (
  id text PRIMARY KEY,
  code text NOT NULL,
  user_id text NOT NULL REFERENCES al_users(id) ON DELETE CASCADE,
  psychologist_slug text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  mode text NOT NULL,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'agendada',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS al_appointments_user_idx ON al_appointments (user_id, created_at DESC);
-- Um psicólogo não pode ter dois pacientes no mesmo dia/horário enquanto o
-- agendamento não estiver cancelado.
CREATE UNIQUE INDEX IF NOT EXISTS al_appointments_slot_key
  ON al_appointments (psychologist_slug, date, time)
  WHERE status <> 'cancelada';

CREATE TABLE IF NOT EXISTS al_applications (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  crp text NOT NULL,
  approach text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS al_applications_created_idx ON al_applications (created_at DESC);
`;

type LocalData = {
  users: StoredUser[];
  sessions: Array<{ token: string; userId: string; createdAt: string; expiresAt: string }>;
  appointments: StoredAppointment[];
  applications: StoredApplication[];
};

type Global = typeof globalThis & {
  __alPool?: Pool;
  __alSchema?: Promise<void>;
  __alMemory?: LocalData;
};

const scope = globalThis as Global;
const onVercel = Boolean(process.env.VERCEL);

function emptyData(): LocalData {
  return { users: [], sessions: [], appointments: [], applications: [] };
}

function connectionString() {
  const value = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  return value && value.trim() ? value.trim() : null;
}

function filePath() {
  if (process.env.ALENTO_DATA_FILE) return process.env.ALENTO_DATA_FILE;
  return ".alento-data.json";
}

export function storageKind(): StorageKind {
  return connectionString() ? "postgres" : onVercel ? "memória" : "arquivo local";
}

async function pool() {
  const connection = connectionString();
  if (!connection) return null;
  if (!scope.__alPool) {
    scope.__alPool = new Pool({
      connectionString: connection,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: connection.includes("localhost") ? undefined : { rejectUnauthorized: false },
    });
    scope.__alPool.on("error", (error) => {
      console.error("[db] erro no pool:", error.message);
    });
  }
  return scope.__alPool;
}

async function ensureSchema(client: import("pg").PoolClient) {
  if (!scope.__alSchema) {
    scope.__alSchema = client.query(SCHEMA_SQL).then(
      () => undefined,
      (error) => {
        scope.__alSchema = undefined;
        throw error;
      },
    );
  }
  return scope.__alSchema;
}

async function withClient<T>(run: (client: import("pg").PoolClient) => Promise<T>): Promise<T | null> {
  const client = await pool();
  if (!client) return null;
  const open = await client.connect();
  try {
    await ensureSchema(open);
    return await run(open);
  } finally {
    open.release();
  }
}

/* ------------------------------ armazenamento local ------------------------------ */

async function readLocal(): Promise<LocalData> {
  if (onVercel) {
    scope.__alMemory ??= emptyData();
    return scope.__alMemory;
  }
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  try {
    const raw = await fs.readFile(
      path.join(/*turbopackIgnore: true*/ process.cwd(), filePath()),
      "utf8",
    );
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      appointments: parsed.appointments ?? [],
      applications: parsed.applications ?? [],
    };
  } catch {
    return emptyData();
  }
}

async function writeLocal(data: LocalData): Promise<void> {
  if (onVercel) {
    scope.__alMemory = data;
    return;
  }
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.writeFile(
    path.join(/*turbopackIgnore: true*/ process.cwd(), filePath()),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
}

/* ------------------------------ usuários ------------------------------ */

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const viaPg = await withClient(async (client) => {
    const result = await client.query(
      "SELECT id, name, email, password_hash, created_at FROM al_users WHERE lower(email) = $1",
      [normalized],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      passwordHash: row.password_hash as string,
      createdAt: new Date(row.created_at as string).toISOString(),
    } satisfies StoredUser;
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg;

  const data = await readLocal();
  return data.users.find((user) => user.email.toLowerCase() === normalized) ?? null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query(
      "SELECT id, name, email, password_hash, created_at FROM al_users WHERE id = $1",
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      passwordHash: row.password_hash as string,
      createdAt: new Date(row.created_at as string).toISOString(),
    } satisfies StoredUser;
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg;

  const data = await readLocal();
  return data.users.find((user) => user.id === id) ?? null;
}

export async function createUser(user: StoredUser): Promise<{ ok: boolean; duplicate?: boolean }> {
  const viaPg = await withClient(async (client) => {
    const inserted = await client.query(
      `INSERT INTO al_users (id, name, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ((lower(email))) DO NOTHING`,
      [user.id, user.name, user.email, user.passwordHash, user.createdAt],
    );
    return { ok: (inserted.rowCount ?? 0) > 0, duplicate: (inserted.rowCount ?? 0) === 0 };
  });
  if (viaPg !== null || storageKind() === "postgres") {
    return viaPg ?? { ok: false };
  }

  const data = await readLocal();
  if (data.users.some((existing) => existing.email.toLowerCase() === user.email.toLowerCase())) {
    return { ok: false, duplicate: true };
  }
  data.users.push(user);
  await writeLocal(data);
  return { ok: true };
}

/* ------------------------------ sessões ------------------------------ */

export async function createSession(token: string, userId: string, expiresAt: string): Promise<void> {
  const viaPg = await withClient(async (client) => {
    await client.query(
      "INSERT INTO al_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
      [token, userId, expiresAt],
    );
  });
  if (viaPg !== null || storageKind() === "postgres") return;

  const data = await readLocal();
  data.sessions = data.sessions.filter((session) => new Date(session.expiresAt).getTime() > Date.now());
  data.sessions.push({ token, userId, createdAt: new Date().toISOString(), expiresAt });
  await writeLocal(data);
}

export async function findSessionUser(token: string): Promise<StoredUser | null> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.created_at
       FROM al_sessions s
       JOIN al_users u ON u.id = s.user_id
       WHERE s.token = $1 AND s.expires_at > now()`,
      [token],
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      passwordHash: row.password_hash as string,
      createdAt: new Date(row.created_at as string).toISOString(),
    } satisfies StoredUser;
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg;

  const data = await readLocal();
  const session = data.sessions.find(
    (item) => item.token === token && new Date(item.expiresAt).getTime() > Date.now(),
  );
  if (!session) return null;
  return data.users.find((user) => user.id === session.userId) ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  const viaPg = await withClient(async (client) => {
    await client.query("DELETE FROM al_sessions WHERE token = $1", [token]);
  });
  if (viaPg !== null || storageKind() === "postgres") return;

  const data = await readLocal();
  data.sessions = data.sessions.filter((session) => session.token !== token);
  await writeLocal(data);
}

/* ------------------------------ agendamentos ------------------------------ */

type AppointmentRow = {
  id: string;
  code: string;
  user_id: string;
  psychologist_slug: string;
  date: string;
  time: string;
  mode: string;
  notes: string;
  status: string;
  created_at: string;
};

function mapAppointment(row: AppointmentRow): StoredAppointment {
  return {
    id: row.id,
    code: row.code,
    userId: row.user_id,
    psychologistSlug: row.psychologist_slug,
    date: row.date,
    time: row.time,
    mode: row.mode as StoredAppointment["mode"],
    notes: row.notes,
    status: row.status as StoredAppointment["status"],
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listAppointments(userId: string): Promise<StoredAppointment[]> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query(
      `SELECT id, code, user_id, psychologist_slug, date, time, mode, notes, status, created_at
       FROM al_appointments WHERE user_id = $1 ORDER BY date DESC, time DESC`,
      [userId],
    );
    return result.rows.map((row) => mapAppointment(row as AppointmentRow));
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? [];

  const data = await readLocal();
  return data.appointments
    .filter((item) => item.userId === userId)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
}

export async function createAppointment(
  appointment: StoredAppointment,
): Promise<{ ok: boolean; conflict?: boolean }> {
  const viaPg = await withClient(async (client) => {
    try {
      await client.query(
        `INSERT INTO al_appointments
           (id, code, user_id, psychologist_slug, date, time, mode, notes, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          appointment.id,
          appointment.code,
          appointment.userId,
          appointment.psychologistSlug,
          appointment.date,
          appointment.time,
          appointment.mode,
          appointment.notes,
          appointment.status,
          appointment.createdAt,
        ],
      );
      return { ok: true };
    } catch (error) {
      if ((error as { code?: string }).code === "23505") return { ok: false, conflict: true };
      throw error;
    }
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? { ok: false };

  const data = await readLocal();
  const taken = data.appointments.some(
    (item) =>
      item.status !== "cancelada" &&
      item.psychologistSlug === appointment.psychologistSlug &&
      item.date === appointment.date &&
      item.time === appointment.time,
  );
  if (taken) return { ok: false, conflict: true };
  data.appointments.push(appointment);
  await writeLocal(data);
  return { ok: true };
}

export async function cancelAppointment(userId: string, id: string): Promise<boolean> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query(
      `UPDATE al_appointments SET status = 'cancelada'
       WHERE id = $1 AND user_id = $2 AND status = 'agendada'`,
      [id, userId],
    );
    return (result.rowCount ?? 0) > 0;
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? false;

  const data = await readLocal();
  const target = data.appointments.find(
    (item) => item.id === id && item.userId === userId && item.status === "agendada",
  );
  if (!target) return false;
  target.status = "cancelada";
  await writeLocal(data);
  return true;
}

export async function takenSlots(slug: string): Promise<string[]> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query(
      `SELECT date, time FROM al_appointments
       WHERE psychologist_slug = $1 AND status <> 'cancelada' AND date >= to_char(now(), 'YYYY-MM-DD')`,
      [slug],
    );
    return result.rows.map((row) => `${row.date} ${row.time}`);
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? [];

  const data = await readLocal();
  return data.appointments
    .filter((item) => item.psychologistSlug === slug && item.status !== "cancelada")
    .map((item) => `${item.date} ${item.time}`);
}

/* ------------------------------ candidaturas ------------------------------ */

export async function createApplication(
  application: StoredApplication,
): Promise<{ ok: boolean }> {
  const viaPg = await withClient(async (client) => {
    await client.query(
      `INSERT INTO al_applications (id, name, email, phone, crp, approach, message, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        application.id,
        application.name,
        application.email,
        application.phone,
        application.crp,
        application.approach,
        application.message,
        application.createdAt,
      ],
    );
    return { ok: true };
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? { ok: false };

  const data = await readLocal();
  data.applications.unshift(application);
  data.applications = data.applications.slice(0, 500);
  await writeLocal(data);
  return { ok: true };
}

export async function countApplications(): Promise<number> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query("SELECT count(*)::int AS total FROM al_applications");
    return Number((result.rows[0] as { total: number }).total);
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? 0;

  const data = await readLocal();
  return data.applications.length;
}

export async function countUsers(): Promise<number> {
  const viaPg = await withClient(async (client) => {
    const result = await client.query("SELECT count(*)::int AS total FROM al_users");
    return Number((result.rows[0] as { total: number }).total);
  });
  if (viaPg !== null || storageKind() === "postgres") return viaPg ?? 0;

  const data = await readLocal();
  return data.users.length;
}

/* ------------------------------ diagnóstico ------------------------------ */

export async function pingDatabase() {
  const connection = connectionString();
  if (!connection) return { ok: false, reason: "sem POSTGRES_URL" };
  const client = await pool();
  if (!client) return { ok: false, reason: "sem pool" };
  try {
    await client.query("SELECT 1");
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: (error as Error).message };
  }
}
