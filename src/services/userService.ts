import api from './api';
import { User, PaginatedResponse } from '../types';

type UserConfiguration = {
  USER_CONFIGURATION?: {
    USERS?: Record<string, any>;
    USER_AVAILABLE_COUNT?: number;
    [key: string]: any;
  };
};

const normaliseUser = (user: any, key: string): User => ({
  configKey: key,
  userId: user.USER_ID?.toString() || key.replace('U_', ''),
  name: user.USER_NAME || '',
  designation: user.USER_DESIGNATION || '',
  role: user.USER_ROLE || user.ROLE || 'USER',
  createdDate: user.CREATE_DATE_TIME || '',
});

const readConfiguration = async (): Promise<{ configuration: Record<string, any>; users: Record<string, any> }> => {
  const { data } = await api.get<UserConfiguration>('/USER_CONFIGURATION');
  const configuration = data?.USER_CONFIGURATION || {};
  const users = configuration.USERS && typeof configuration.USERS === 'object'
    ? configuration.USERS
    : {};
  return { configuration, users };
};

const postUsers = (configuration: Record<string, any>, users: Record<string, any>) => {
  const availableCount = Number(configuration.USER_AVAILABLE_COUNT);
  return api.post('/USER_CONFIGURATION', {
    USER_CONFIGURATION: {
      USER_AVAILABLE_COUNT: Number.isFinite(availableCount) ? availableCount : 5,
      USERS: users,
    },
  });
};

const getApiErrorMessage = (error: any, fallback: string): string => {
  const responseData = error?.response?.data;
  if (typeof responseData === 'string') {
    try {
      const parsed = JSON.parse(responseData);
      return parsed.MESSAGE || parsed.message || parsed.error || responseData;
    } catch {
      return responseData;
    }
  }
  if (responseData && typeof responseData === 'object') {
    const nestedMessage = responseData.USER_CONFIGURATION?.MESSAGE || responseData.USER_CONFIGURATION?.message;
    return responseData.MESSAGE || responseData.message || responseData.error ||
      responseData.ERROR || responseData.Error || nestedMessage || fallback;
  }
  return fallback;
};

const toApiUser = (user: Partial<User>, previous: Record<string, any> = {}) => ({
  ...previous,
  USER_ID: user.userId,
  USER_NAME: user.name || '',
  USER_DESIGNATION: user.designation || '',
  ...(user.password ? { USER_PASSWORD: user.password } : {}),
  USER_ROLE: user.role || previous.USER_ROLE || previous.ROLE || 'UNKNOWN',
});

export const userService = {
  async getUsers({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    try {
      const { users: usersByKey } = await readConfiguration();
      const rawUsers = Object.entries(usersByKey).map(([key, user]) => normaliseUser(user, key));
      const query = search.trim().toLowerCase();
      const filtered = query
        ? rawUsers.filter(user => user.userId.toLowerCase().includes(query) || user.name.toLowerCase().includes(query))
        : rawUsers;
      const safeLimit = Math.max(1, Math.floor(limit) || 10);
      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / safeLimit));
      const safePage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
      const start = (safePage - 1) * safeLimit;
      return {
        data: filtered.slice(start, start + safeLimit),
        pagination: { page: safePage, limit: safeLimit, total, totalPages },
      };
    } catch (error) {
      console.error('[userService] Failed to fetch users:', error);
      throw new Error('Unable to retrieve user data from device.');
    }
  },

  async createUsers(payloads: Partial<User>[]): Promise<{ created: Partial<User>[]; failed: any[] }> {
    try {
      const seenIds = new Set<string>();
      const failed: Partial<User>[] = [];
      const accepted = payloads.filter(user => {
        const id = String(user.userId || '').trim().toLowerCase();
        if (!id || seenIds.has(id)) {
          failed.push(user);
          return false;
        }
        seenIds.add(id);
        return true;
      });

      if (!accepted.length) return { created: [], failed };

      const users = accepted.reduce((result: Record<string, any>, user, index) => {
        result[`U_${index + 1}`] = toApiUser(user);
        return result;
      }, {});

      const payload = {
        USER_CONFIGURATION: {
          USER_AVAILABLE_COUNT: 5,
          USERS: users,
        },
      };
      await api.post('/USER_CONFIGURATION', JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' },
      });
      return { created: accepted.map(({ password, ...user }) => user), failed };
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to save users to the device.');
      console.error('[userService] Failed to create users:', error instanceof Error ? error.message : message);
      throw new Error(message);
    }
  },

  async updateUser(originalUserId: string, user: Partial<User>): Promise<void> {
    try {
      const { configuration, users } = await readConfiguration();
      const entry = Object.entries(users).find(([, value]: [string, any]) => String(value.USER_ID || '').toLowerCase() === originalUserId.toLowerCase());
      if (!entry) throw new Error('User no longer exists on the device.');
      const [key, previous] = entry;
      const updatedUsers = { ...users, [key]: toApiUser(user, previous) };
      await postUsers(configuration, updatedUsers);
    } catch (error) {
      console.error('[userService] Failed to update user:', error);
      throw error instanceof Error && error.message === 'User no longer exists on the device.'
        ? error
        : new Error('Unable to update user on the device.');
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { configuration, users } = await readConfiguration();
      const matchingKeys = Object.entries(users)
        .filter(([, user]: [string, any]) => String(user.USER_ID || '').toLowerCase() === userId.toLowerCase())
        .map(([key]) => key);
      if (!matchingKeys.length) throw new Error('User no longer exists on the device.');
      const updatedUsers = { ...users };
      matchingKeys.forEach(key => delete updatedUsers[key]);
      await postUsers(configuration, updatedUsers);
      return true;
    } catch (error) {
      console.error('[userService] Failed to delete user:', error);
      throw error instanceof Error && error.message === 'User no longer exists on the device.'
        ? error
        : new Error('Unable to delete user from the device.');
    }
  },
};
