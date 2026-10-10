import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublicShell } from "@/components/site/PublicShell";
import { RoleAssignForm } from "@/components/admin/RoleAssignForm";
import { currentUser, isAdmin } from "@/lib/auth";
import {
  countAppointments,
  countApplications,
  countUsers,
  listAllUsers,
  listApplications,
  listRecentAppointments,
} from "@/lib/db";
import { psychologists } from "@/lib/site";

export const metadata: Metadata = {
  title: "Administração",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  agendada: "Agendada",
  cancelada: "Cancelada",
  realizada: "Realizada",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function psychologistName(slug: string) {
  return psychologists.find((item) => item.slug === slug)?.name ?? slug;
}

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/entrar?next=/admin");
  if (!isAdmin(user)) notFound();

  const [users, appointmentsCount, applicationsCount, appointments, applications, allUsers] =
    await Promise.all([
      countUsers(),
      countAppointments(),
      countApplications(),
      listRecentAppointments(30),
      listApplications(20),
      listAllUsers(50),
    ]);

  const stats = [
    { label: "Usuários", value: users },
    { label: "Agendamentos", value: appointmentsCount },
    { label: "Candidaturas", value: applicationsCount },
  ];

  return (
    <PublicShell>
      <section className="section section-mist pb-12">
        <div className="shell">
          <p className="label label-sage">Área restrita</p>
          <h1 className="display mt-4 text-[clamp(2rem,4.4vw,3rem)] text-ink">Administração</h1>
          <p className="lede mt-3">Visão geral de usuários, sessões e candidaturas da clínica.</p>
        </div>
      </section>

      <section className="section pt-10">
        <div className="shell">
          <div className="grid gap-5 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-5">
                <p className="label">{stat.label}</p>
                <p className="display mt-2 text-[2rem] text-ink">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="shell">
          <h2 className="text-[17px] font-medium text-ink">Acessos e perfis</h2>
          <p className="mt-1 text-[13px] text-stone">
            Vincule uma conta de psicólogo(a) a um dos perfis da clínica para liberar a agenda.
          </p>

          <div className="mt-5">
            <RoleAssignForm
              options={psychologists.map((person) => ({ slug: person.slug, name: person.name }))}
            />
          </div>

          {allUsers.length > 0 && (
            <div className="card mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-stone">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Telefone</th>
                    <th className="px-4 py-3 font-medium">Perfil</th>
                    <th className="px-4 py-3 font-medium">Desde</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((item) => (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">{item.name}</td>
                      <td className="px-4 py-3 text-graphite">{item.email}</td>
                      <td className="px-4 py-3 text-graphite">{item.phone || "—"}</td>
                      <td className="px-4 py-3 text-graphite">
                        {item.role === "psychologist"
                          ? `Psicólogo(a) · ${psychologistName(item.psychologistSlug ?? "")}`
                          : "Paciente"}
                      </td>
                      <td className="px-4 py-3 text-graphite">{formatDay(item.createdAt.slice(0, 10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section pt-0">
        <div className="shell">
          <h2 className="text-[17px] font-medium text-ink">Agendamentos recentes</h2>
          {appointments.length === 0 ? (
            <p className="lede mt-4">Nenhum agendamento ainda.</p>
          ) : (
            <div className="card mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-stone">
                    <th className="px-4 py-3 font-medium">Código</th>
                    <th className="px-4 py-3 font-medium">Paciente</th>
                    <th className="px-4 py-3 font-medium">Psicólogo</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Modalidade</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((item) => (
                    <tr key={item.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{item.code}</td>
                      <td className="px-4 py-3">
                        <span className="text-ink">{item.patientName}</span>
                        <br />
                        <span className="text-stone">{item.patientEmail}</span>
                      </td>
                      <td className="px-4 py-3 text-graphite">
                        {psychologistName(item.psychologistSlug)}
                      </td>
                      <td className="px-4 py-3 text-graphite">
                        {formatDay(item.date)} · {item.time}
                      </td>
                      <td className="px-4 py-3 text-graphite">
                        {item.mode === "online" ? "Online" : "Presencial"}
                      </td>
                      <td className="px-4 py-3 text-graphite">
                        {statusLabel[item.status] ?? item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="section pt-0">
        <div className="shell">
          <h2 className="text-[17px] font-medium text-ink">Candidaturas de psicólogos</h2>
          {applications.length === 0 ? (
            <p className="lede mt-4">Nenhuma candidatura recebida.</p>
          ) : (
            <div className="mt-5 grid gap-4">
              {applications.map((item) => (
                <div key={item.id} className="card p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[15px] font-medium text-ink">{item.name}</p>
                    <p className="text-[12px] text-stone">{formatDateTime(item.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-[13px] text-graphite">
                    {item.email} · {item.phone} · CRP {item.crp} · {item.approach}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-graphite">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
