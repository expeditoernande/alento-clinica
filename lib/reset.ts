import { randomBytes } from "node:crypto";
import { setResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TTL_MINUTES = 60;

export async function issuePasswordReset(user: { id: string; name: string; email: string }) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + RESET_TTL_MINUTES * 60_000).toISOString();
  await setResetToken(user.id, token, expires);
  await sendPasswordResetEmail({ name: user.name, email: user.email }, token).catch(() => undefined);
}
