export type StoredUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  psychologistSlug: string | null;
  emailVerified: boolean;
  verifyToken: string | null;
  verifyTokenExpires: string | null;
  resetToken: string | null;
  resetTokenExpires: string | null;
  passwordHash: string;
  createdAt: string;
};

export type Role = "patient" | "psychologist";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type AppointmentStatus = "agendada" | "cancelada" | "realizada";

export type StoredAppointment = {
  id: string;
  code: string;
  userId: string;
  psychologistSlug: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  mode: "online" | "presencial";
  notes: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type StoredApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  crp: string;
  approach: string;
  message: string;
  createdAt: string;
};

export type StorageKind = "postgres" | "arquivo local" | "memória";

export type AdminUser = PublicUser & { createdAt: string; role: Role; psychologistSlug: string | null };

export type AdminAppointment = StoredAppointment & {
  patientName: string;
  patientEmail: string;
};

export type WeeklyWindow = {
  id: string;
  weekday: number;
  start: string;
  end: string;
};

export type AvailabilityBlock = {
  id: string;
  date: string;
  start: string | null;
  end: string | null;
  reason: string;
  createdAt: string;
};
