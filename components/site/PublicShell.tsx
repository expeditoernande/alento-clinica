import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { currentStoredUser, isAdmin } from "@/lib/auth";

export async function PublicShell({ children }: { children: ReactNode }) {
  const stored = await currentStoredUser();
  const user = stored
    ? { id: stored.id, name: stored.name, email: stored.email, phone: stored.phone }
    : null;
  const isPsychologist = Boolean(stored?.role === "psychologist" && stored.psychologistSlug);
  return (
    <>
      <Nav user={user} isAdmin={isAdmin(user)} isPsychologist={isPsychologist} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
