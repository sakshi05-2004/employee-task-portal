import { cookies } from "next/headers";
import { verifySession } from "./session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  return await verifySession(sessionToken);
}