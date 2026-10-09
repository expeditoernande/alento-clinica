import type { ReactNode } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { currentUser } from "@/lib/auth";

export async function PublicShell({ children }: { children: ReactNode }) {
  const user = await currentUser();
  return (
    <>
      <Nav user={user} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
