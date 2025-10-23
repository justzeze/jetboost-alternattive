import { supabase, isSupabaseConfigured } from './supabase';
import { db as memoryDb, Project, User, WishlistItem, Session, AnalyticsEvent } from './db';

const useSupabase = isSupabaseConfigured();

export const db = {
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    if (!useSupabase) {
      const newProject: Project = {
        id: crypto.randomUUID(),
        ...project,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return memoryDb.createProject(newProject);
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: project.name,
        domain: project.domain,
        api_key: project.apiKey
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      domain: data.domain,
      apiKey: data.api_key,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getProject(id: string): Promise<Project | null> {
    if (!useSupabase) {
      return memoryDb.getProject(id) || null;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      domain: data.domain,
      apiKey: data.api_key,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getProjectByApiKey(apiKey: string): Promise<Project | null> {
    if (!useSupabase) {
      return memoryDb.getProjectByApiKey(apiKey) || null;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      domain: data.domain,
      apiKey: data.api_key,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getAllProjects(): Promise<Project[]> {
    if (!useSupabase) {
      return memoryDb.getAllProjects();
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      name: d.name,
      domain: d.domain,
      apiKey: d.api_key,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at)
    }));
  },

  async deleteProject(id: string): Promise<boolean> {
    if (!useSupabase) {
      return memoryDb.deleteProject(id);
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    return !error;
  },

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!useSupabase) {
      const newUser: User = {
        id: crypto.randomUUID(),
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return memoryDb.createUser(newUser);
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        project_id: user.projectId,
        email: user.email,
        password_hash: user.passwordHash,
        first_name: user.firstName,
        last_name: user.lastName
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      projectId: data.project_id,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined
    };
  },

  async getUser(id: string): Promise<User | null> {
    if (!useSupabase) {
      return memoryDb.getUser(id) || null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      projectId: data.project_id,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined
    };
  },

  async getUserByEmail(projectId: string, email: string): Promise<User | null> {
    if (!useSupabase) {
      return memoryDb.getUserByEmail(projectId, email) || null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('project_id', projectId)
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      projectId: data.project_id,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined
    };
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    if (!useSupabase) {
      return memoryDb.updateUser(id, updates) || null;
    }

    const updateData: any = {};
    if (updates.lastLoginAt) updateData.last_login_at = updates.lastLoginAt.toISOString();
    if (updates.firstName) updateData.first_name = updates.firstName;
    if (updates.lastName) updateData.last_name = updates.lastName;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      projectId: data.project_id,
      email: data.email,
      passwordHash: data.password_hash,
      firstName: data.first_name,
      lastName: data.last_name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined
    };
  },

  async getUsersByProject(projectId: string): Promise<User[]> {
    if (!useSupabase) {
      return memoryDb.getUsersByProject(projectId);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      projectId: d.project_id,
      email: d.email,
      passwordHash: d.password_hash,
      firstName: d.first_name,
      lastName: d.last_name,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
      lastLoginAt: d.last_login_at ? new Date(d.last_login_at) : undefined
    }));
  },

  async createWishlistItem(item: Omit<WishlistItem, 'id' | 'createdAt'>): Promise<WishlistItem> {
    if (!useSupabase) {
      const newItem: WishlistItem = {
        id: crypto.randomUUID(),
        ...item,
        createdAt: new Date()
      };
      return memoryDb.createWishlistItem(newItem);
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert([{
        user_id: item.userId,
        item_id: item.itemId,
        item_data: item.itemData
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      itemId: data.item_id,
      itemData: data.item_data,
      createdAt: new Date(data.created_at)
    };
  },

  async getWishlistItem(id: string): Promise<WishlistItem | null> {
    if (!useSupabase) {
      return memoryDb.getWishlistItem(id) || null;
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      itemId: data.item_id,
      itemData: data.item_data,
      createdAt: new Date(data.created_at)
    };
  },

  async getWishlistItemsByUser(userId: string): Promise<WishlistItem[]> {
    if (!useSupabase) {
      return memoryDb.getWishlistItemsByUser(userId);
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map(d => ({
      id: d.id,
      userId: d.user_id,
      itemId: d.item_id,
      itemData: d.item_data,
      createdAt: new Date(d.created_at)
    }));
  },

  async getWishlistItemByUserAndItemId(userId: string, itemId: string): Promise<WishlistItem | null> {
    if (!useSupabase) {
      return memoryDb.getWishlistItemByUserAndItemId(userId, itemId) || null;
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      itemId: data.item_id,
      itemData: data.item_data,
      createdAt: new Date(data.created_at)
    };
  },

  async deleteWishlistItem(id: string): Promise<boolean> {
    if (!useSupabase) {
      return memoryDb.deleteWishlistItem(id);
    }

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', id);

    return !error;
  },

  async createSession(session: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    if (!useSupabase) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        ...session,
        createdAt: new Date()
      };
      return memoryDb.createSession(newSession);
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([{
        user_id: session.userId,
        token: session.token,
        expires_at: session.expiresAt.toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at)
    };
  },

  async getSessionByToken(token: string): Promise<Session | null> {
    if (!useSupabase) {
      return memoryDb.getSessionByToken(token) || null;
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      userId: data.user_id,
      token: data.token,
      expiresAt: new Date(data.expires_at),
      createdAt: new Date(data.created_at)
    };
  },

  async deleteSession(id: string): Promise<boolean> {
    if (!useSupabase) {
      return memoryDb.deleteSession(id);
    }

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    return !error;
  },

  async createAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'createdAt'>): Promise<AnalyticsEvent> {
    if (!useSupabase) {
      const newEvent: AnalyticsEvent = {
        id: crypto.randomUUID(),
        ...event,
        createdAt: new Date()
      };
      return memoryDb.createAnalyticsEvent(newEvent);
    }

    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        project_id: event.projectId,
        event_type: event.eventType,
        user_id: event.userId,
        metadata: event.metadata
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      projectId: data.project_id,
      eventType: data.event_type,
      userId: data.user_id,
      metadata: data.metadata,
      createdAt: new Date(data.created_at)
    };
  },

  async getAnalyticsStats(projectId: string): Promise<{
    totalUsers: number;
    totalWishlists: number;
    totalEvents: number;
    recentLogins: number;
  }> {
    if (!useSupabase) {
      return memoryDb.getAnalyticsStats(projectId);
    }

    const [usersResult, wishlistsResult, eventsResult, loginsResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('wishlist_items').select('id', { count: 'exact', head: true }).eq('user_id', projectId),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('analytics_events')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('event_type', 'login')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    const users = await this.getUsersByProject(projectId);
    let totalWishlists = 0;
    for (const user of users) {
      const items = await this.getWishlistItemsByUser(user.id);
      totalWishlists += items.length;
    }

    return {
      totalUsers: usersResult.count || 0,
      totalWishlists,
      totalEvents: eventsResult.count || 0,
      recentLogins: loginsResult.count || 0
    };
  }
};
