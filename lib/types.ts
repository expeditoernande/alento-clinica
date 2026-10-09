export type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
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
