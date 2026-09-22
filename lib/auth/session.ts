import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET is not configured");
}

const secretKey = new TextEncoder().encode(secret);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  mustChangePassword: boolean;
}

export async function createSession(user: SessionUser) {
  return await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}
