import { siteUrl } from "@/lib/seo";

type SendInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendResult = { ok: boolean; skipped?: boolean; error?: string };

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function sender(): string {
  return process.env.EMAIL_FROM || "ALENTO <onboarding@resend.dev>";
}

export async function sendEmail({ to, subject, html, text }: SendInput): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY não configurada — e-mail não enviado:", subject);
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: sender(), to, subject, html, text }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("[email] falha ao enviar:", response.status, detail);
      return { ok: false, error: detail };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] erro de rede:", (error as Error).message);
    return { ok: false, error: (error as Error).message };
  }
}

export async function sendWelcomeEmail(user: { name: string; email: string }): Promise<SendResult> {
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;
  const accountUrl = `${siteUrl()}/minha-conta`;
  const bookUrl = `${siteUrl()}/agendar`;

  const html = `
  <div style="background:#f5f3ee;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#1c1d1b">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid #e6e2d9">
        <p style="margin:0;font-size:20px;letter-spacing:2px;color:#4d6b52">ALENTO</p>
      </div>
      <div style="padding:32px">
        <h1 style="margin:0 0 12px;font-size:22px;color:#1c1d1b">Que bom ter você, ${firstName}!</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#54564f">
          Sua conta na ALENTO foi criada com sucesso. A partir de agora você pode agendar
          sessões, acompanhar seus horários e conversar com nossos psicólogos.
        </p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#54564f">
          Seu e-mail de acesso é <strong>${user.email}</strong>. Trate esta mensagem com cuidado
          e não compartilhe sua senha com ninguém.
        </p>
        <a href="${bookUrl}" style="display:inline-block;background:#4d6b52;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px">
          Agendar minha primeira sessão
        </a>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#8a8b83">
          Acesse sua conta a qualquer momento em <a href="${accountUrl}" style="color:#4d6b52">${accountUrl}</a>.
        </p>
      </div>
      <div style="padding:20px 32px;background:#faf9f6;font-size:12px;line-height:1.6;color:#8a8b83">
        Você recebeu este e-mail porque criou uma conta na ALENTO — clínica de psicologia.<br />
        Se não foi você, ignore esta mensagem.
      </div>
    </div>
  </div>`;

  const text = [
    `Que bom ter você, ${firstName}!`,
    "",
    "Sua conta na ALENTO foi criada com sucesso.",
    `Seu e-mail de acesso é ${user.email}.`,
    "",
    `Agende sua primeira sessão: ${bookUrl}`,
    `Acesse sua conta: ${accountUrl}`,
    "",
    "Se não foi você, ignore esta mensagem.",
  ].join("\n");

  return sendEmail({ to: user.email, subject: "Sua conta na ALENTO foi criada", html, text });
}
