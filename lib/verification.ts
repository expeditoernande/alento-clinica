import { randomBytes } from "node:crypto";
import { setVerificationToken } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

const VERIFICATION_TTL_MINUTES = 60 * 24;

export async function issueVerification(user: { id: string; name: string; email: string }) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60_000).toISOString();
  await setVerificationToken(user.id, token, expires);
  await sendVerificationEmail({ name: user.name, email: user.email }, token).catch(() => undefined);
}
