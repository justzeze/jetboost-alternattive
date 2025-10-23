
export interface Project {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  projectId: string;
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  itemId: string;
  itemData?: any;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AnalyticsEvent {
  id: string;
  projectId: string;
  eventType: string;
  userId?: string;
  metadata?: any;
  createdAt: Date;
}

class InMemoryDB {
  private projects: Map<string, Project> = new Map();
  private users: Map<string, User> = new Map();
  private wishlistItems: Map<string, WishlistItem> = new Map();
  private sessions: Map<string, Session> = new Map();
  private analyticsEvents: AnalyticsEvent[] = [];

  createProject(project: Project): Project {
    this.projects.set(project.id, project);
    return project;
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getProjectByApiKey(apiKey: string): Project | undefined {
    return Array.from(this.projects.values()).find(p => p.apiKey === apiKey);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(projectId: string, email: string): User | undefined {
    return Array.from(this.users.values()).find(
      u => u.projectId === projectId && u.email === email
    );
  }

  getUsersByProject(projectId: string): User[] {
    return Array.from(this.users.values()).filter(u => u.projectId === projectId);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  createWishlistItem(item: WishlistItem): WishlistItem {
    this.wishlistItems.set(item.id, item);
    return item;
  }

  getWishlistItem(id: string): WishlistItem | undefined {
    return this.wishlistItems.get(id);
  }

  getWishlistItemsByUser(userId: string): WishlistItem[] {
    return Array.from(this.wishlistItems.values()).filter(i => i.userId === userId);
  }

  getWishlistItemByUserAndItemId(userId: string, itemId: string): WishlistItem | undefined {
    return Array.from(this.wishlistItems.values()).find(
      i => i.userId === userId && i.itemId === itemId
    );
  }

  deleteWishlistItem(id: string): boolean {
    return this.wishlistItems.delete(id);
  }

  createSession(session: Session): Session {
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getSessionByToken(token: string): Session | undefined {
    return Array.from(this.sessions.values()).find(s => s.token === token);
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  deleteExpiredSessions(): void {
    const now = new Date();
    Array.from(this.sessions.entries()).forEach(([id, session]) => {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    });
  }

  createAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
    this.analyticsEvents.push(event);
    return event;
  }

  getAnalyticsEventsByProject(projectId: string, limit: number = 100): AnalyticsEvent[] {
    return this.analyticsEvents
      .filter(e => e.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getAnalyticsStats(projectId: string): {
    totalUsers: number;
    totalWishlists: number;
    totalEvents: number;
    recentLogins: number;
  } {
    const users = this.getUsersByProject(projectId);
    const events = this.analyticsEvents.filter(e => e.projectId === projectId);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogins = events.filter(
      e => e.eventType === 'login' && e.createdAt > oneDayAgo
    ).length;

    const totalWishlists = users.reduce((sum, user) => {
      return sum + this.getWishlistItemsByUser(user.id).length;
    }, 0);

    return {
      totalUsers: users.length,
      totalWishlists,
      totalEvents: events.length,
      recentLogins
    };
  }
}

export const db = new InMemoryDB();
