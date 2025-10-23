import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db-supabase';
import { User, Session } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, projectId: string): string {
  return jwt.sign({ userId, projectId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; projectId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; projectId: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<Session> {
  const user = await db.getUser(userId);
  if (!user) throw new Error('User not found');

  const token = generateToken(userId, user.projectId);
  const session = await db.createSession({
    userId,
    token,
    expiresAt: new Date(Date.now() + SESSION_DURATION)
  });

  return session;
}

export async function validateSession(token: string): Promise<Session | null> {
  const session = await db.getSessionByToken(token);
  if (!session) return null;
  
  if (session.expiresAt < new Date()) {
    await db.deleteSession(session.id);
    return null;
  }

  return session;
}

export async function register(
  projectId: string,
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<{ user: User; session: Session }> {
  const existingUser = await db.getUserByEmail(projectId, email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashPassword(password);
  const user = await db.createUser({
    projectId,
    email,
    passwordHash,
    firstName,
    lastName
  });

  const session = await createSession(user.id);

  await db.createAnalyticsEvent({
    projectId,
    eventType: 'register',
    userId: user.id
  });

  return { user, session };
}

export async function login(
  projectId: string,
  email: string,
  password: string
): Promise<{ user: User; session: Session }> {
  const user = await db.getUserByEmail(projectId, email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  await db.updateUser(user.id, { lastLoginAt: new Date() });

  const session = await createSession(user.id);

  await db.createAnalyticsEvent({
    projectId,
    eventType: 'login',
    userId: user.id
  });

  return { user, session };
}

export async function logout(token: string): Promise<boolean> {
  const session = await db.getSessionByToken(token);
  if (!session) return false;
  
  return await db.deleteSession(session.id);
}
