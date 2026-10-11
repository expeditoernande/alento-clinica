export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function clean(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanMultiline(value: unknown, max = 2000): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

export function digits(value: string): string {
  return value.replace(/\D+/g, "");
}

export type RegisterInput = { name: string; email: string; password: string };

export function validateRegister(body: Record<string, unknown>): {
  data?: RegisterInput;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (name.length < 2) errors.name = "Informe seu nome completo.";
  if (!isEmail(email)) errors.email = "E-mail inválido.";
  if (password.length < 8) errors.password = "A senha precisa de ao menos 8 caracteres.";
  else if (password.length > 100) errors.password = "Senha muito longa.";
  if (confirmPassword !== password) errors.confirmPassword = "As senhas não coincidem.";

  if (Object.keys(errors).length) return { errors };
  return { data: { name, email, password }, errors };
}

export function validateLogin(body: Record<string, unknown>): {
  data?: { email: string; password: string };
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const email = clean(body.email, 120).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!isEmail(email)) errors.email = "E-mail inválido.";
  if (!password) errors.password = "Informe sua senha.";
  if (Object.keys(errors).length) return { errors };
  return { data: { email, password }, errors };
}

export type ProfileInput = { email: string; phone: string };

export function validateProfile(body: Record<string, unknown>): {
  data?: ProfileInput;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);

  if (!isEmail(email)) errors.email = "E-mail inválido.";
  if (phone && digits(phone).length < 10) errors.phone = "Telefone incompleto. Inclua o DDD.";

  if (Object.keys(errors).length) return { errors };
  return { data: { email, phone }, errors };
}

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  crp: string;
  approach: string;
  message: string;
};

export function validateApplication(body: Record<string, unknown>): {
  data?: ApplicationInput;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const phone = clean(body.phone, 30);
  const crp = clean(body.crp, 30);
  const approach = clean(body.approach, 80);
  const message = cleanMultiline(body.message, 2000);

  if (name.length < 2) errors.name = "Informe seu nome.";
  if (!isEmail(email)) errors.email = "E-mail inválido.";
  if (digits(phone).length < 10) errors.phone = "Telefone incompleto.";
  if (digits(crp).length < 5) errors.crp = "Informe o número do CRP.";
  if (!approach) errors.approach = "Escolha sua abordagem.";
  if (message.length < 20) errors.message = "Conte um pouco mais (mín. 20 caracteres).";

  if (Object.keys(errors).length) return { errors };
  return { data: { name, email, phone, crp, approach, message }, errors };
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type AppointmentInput = {
  psychologistSlug: string;
  date: string;
  time: string;
  mode: "online" | "presencial";
  notes: string;
};

export function validateAppointment(body: Record<string, unknown>): {
  data?: AppointmentInput;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const psychologistSlug = clean(body.psychologistSlug, 60);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const mode = body.mode === "presencial" ? "presencial" : "online";
  const notes = cleanMultiline(body.notes, 600);

  if (!psychologistSlug) errors.psychologistSlug = "Escolha um psicólogo.";
  if (!DATE_RE.test(date)) errors.date = "Data inválida.";
  else {
    const chosen = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime())) errors.date = "Data inválida.";
    else if (chosen < today) errors.date = "Escolha uma data a partir de hoje.";
  }
  if (!TIME_RE.test(time)) errors.time = "Horário inválido.";

  if (Object.keys(errors).length) return { errors };
  return { data: { psychologistSlug, date, time, mode, notes }, errors };
}

export function validateReschedule(body: Record<string, unknown>): {
  data?: { date: string; time: string };
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);

  if (!DATE_RE.test(date)) errors.date = "Data inválida.";
  else {
    const chosen = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime())) errors.date = "Data inválida.";
    else if (chosen < today) errors.date = "Escolha uma data a partir de hoje.";
  }
  if (!TIME_RE.test(time)) errors.time = "Horário inválido.";

  if (Object.keys(errors).length) return { errors };
  return { data: { date, time }, errors };
}

export type WeeklyWindowInput = { weekday: number; start: string; end: string };

export function validateWeeklyWindows(body: Record<string, unknown>): {
  data?: WeeklyWindowInput[];
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const raw = Array.isArray(body.windows) ? body.windows : [];
  const data: WeeklyWindowInput[] = [];

  if (raw.length > 60) return { errors: { windows: "Grade muito extensa." } };

  raw.forEach((item) => {
    const entry = (item ?? {}) as Record<string, unknown>;
    const weekday = Number(entry.weekday);
    const start = clean(entry.start, 5);
    const end = clean(entry.end, 5);
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return;
    if (!TIME_RE.test(start) || !TIME_RE.test(end) || start >= end) return;
    data.push({ weekday, start, end });
  });

  if (raw.length > 0 && data.length !== raw.length) {
    errors.windows = "Verifique os horários: o início deve ser antes do fim.";
  }

  if (Object.keys(errors).length) return { errors };
  return { data, errors };
}

export type BlockInput = { date: string; start: string | null; end: string | null; reason: string };

export function validateBlock(body: Record<string, unknown>): {
  data?: BlockInput;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};
  const date = clean(body.date, 10);
  const reason = clean(body.reason, 120);
  const start = clean(body.start, 5);
  const end = clean(body.end, 5);
  const fullDay = body.fullDay === true || (!start && !end);

  if (!DATE_RE.test(date)) errors.date = "Data inválida.";

  let rangeStart: string | null = null;
  let rangeEnd: string | null = null;
  if (!fullDay) {
    if (!TIME_RE.test(start) || !TIME_RE.test(end) || start >= end) {
      errors.start = "Informe um período válido.";
    } else {
      rangeStart = start;
      rangeEnd = end;
    }
  }

  if (Object.keys(errors).length) return { errors };
  return { data: { date, start: rangeStart, end: rangeEnd, reason }, errors };
}

/* ------------------------------ honeypot + rate limit ------------------------------ */
export function isBot(body: Record<string, unknown>): boolean {
  const honeypot = typeof body.website === "string" ? body.website : "";
  return honeypot.trim().length > 0;
}

type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit = 6, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }
  return { ok: true, remaining: limit - bucket.count };
}

export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

export function code(): string {
  return `AL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
