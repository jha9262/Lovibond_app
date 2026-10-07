import api from './api';
import { User, PaginatedResponse } from '../types';

type UserConfiguration = {
  USER_CONFIGURATION?: {
    USERS?: Record<string, any>;
    USER_AVAILABLE_COUNT?: number;
    [key: string]: any;
  };
};

const parseJsonSafely = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
};

const normaliseUser = (user: any, key: string): User => {
  let role = String(user.USER_ROLE || user.ROLE || 'user').trim();
  if (role.toUpperCase() === 'UNKNOWN' || !role) {
    role = 'user';
  }
  return {
    configKey: key,
    userId: user.USER_ID?.toString() || key.replace('U_', ''),
    name: user.USER_NAME || '',
    designation: user.USER_DESIGNATION || '',
    role: role,
    password: user.USER_PASSWORD || '',
    createdDate: user.CREATE_DATE_TIME || '',
  };
};

const toApiUser = (user: Partial<User>, previous: Record<string, any> = {}) => {
  let role = user.role || previous.USER_ROLE || previous.ROLE || 'user';
  if (String(role).toUpperCase() === 'UNKNOWN') {
    role = 'user';
  }
  return {
    ...previous,
    USER_ID: user.userId || previous.USER_ID || '',
    USER_NAME: user.name !== undefined ? user.name : (previous.USER_NAME || ''),
    USER_DESIGNATION: user.designation !== undefined ? user.designation : (previous.USER_DESIGNATION || ''),
    ...(user.password ? { USER_PASSWORD: user.password } : (previous.USER_PASSWORD ? { USER_PASSWORD: previous.USER_PASSWORD } : {})),
    USER_ROLE: String(role).trim().toUpperCase() || 'USER',
  };
};

/** Reads user configuration from the documented device endpoint. */
const readConfiguration = async (): Promise<{ configuration: Record<string, any>; users: Record<string, any> }> => {
  const res = await api.get<UserConfiguration>('/USER_CONFIGURATION');
  const responseData = parseJsonSafely(res.data);
  const configuration = responseData?.USER_CONFIGURATION || {};
  const users = configuration.USERS && typeof configuration.USERS === 'object'
    ? configuration.USERS
    : {};
  return { configuration, users };
};

/** Sends JSON to the device, falling back to PUT only when POST is unsupported. */
const sendSaveUserRequest = async (payload: any) => {
  const jsonBody = JSON.stringify(payload);
  try {
    return await api.post('/USER_CONFIGURATION', jsonBody, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err1: any) {
    if (err1?.response?.status !== 404 && err1?.response?.status !== 405) {
      throw err1;
    }
    try {
      return await api.put('/USER_CONFIGURATION', jsonBody, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      throw err1;
    }
  }
};

const sendUpdateUserRequest = (payload: any) => api.put('/USER_CONFIGURATION', JSON.stringify(payload), {
  headers: { 'Content-Type': 'application/json' },
});

const getApiErrorMessage = (error: any, fallback: string): string => {
  const responseData = parseJsonSafely(error?.response?.data);
  if (typeof responseData === 'string') {
    return responseData;
  }
  if (responseData && typeof responseData === 'object') {
    const nestedMessage = responseData.USER_CONFIGURATION?.MESSAGE || responseData.USER_CONFIGURATION?.message;
    return responseData.MESSAGE || responseData.message || responseData.error ||
      responseData.ERROR || responseData.Error || nestedMessage || fallback;
  }
  return fallback;
};

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

  /** Creates user(s) using the device's new-user payload format. */
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

      const { users: existingUsers } = await readConfiguration();
      const existingIds = new Set(
        Object.values(existingUsers).map((user: any) => String(user.USER_ID || '').trim().toLowerCase())
      );
      const usersToCreate = accepted.filter((user) => {
        const id = String(user.userId || '').trim().toLowerCase();
        if (existingIds.has(id)) {
          failed.push(user);
          return false;
        }
        existingIds.add(id);
        return true;
      });

      if (!usersToCreate.length) return { created: [], failed };

      // The device create API expects only the new user entries; it assigns device slots.
      const newUsers = usersToCreate.reduce((result: Record<string, any>, user, index) => {
        result[`U_${index + 1}`] = toApiUser(user);
        return result;
      }, {});

      const payload = {
        USER_CONFIGURATION: {
          USER_AVAILABLE_COUNT: 0,
          USERS: newUsers,
        },
      };

      try {
        await sendSaveUserRequest(payload);
      } catch (saveError) {
        // Some device firmware saves the user but responds with an error afterward.
        // Confirm the write from the canonical GET response before reporting failure.
        const savedConfiguration = await readConfiguration().catch(() => null);
        const savedUsers = savedConfiguration?.users || {};
        const wasSaved = usersToCreate.every((user) => {
          const expected = toApiUser(user);
          const saved = Object.values(savedUsers).find(
            (candidate: any) => String(candidate.USER_ID || '').trim().toLowerCase() === String(user.userId || '').trim().toLowerCase()
          ) as Record<string, any> | undefined;

          return Boolean(saved) &&
            saved?.USER_NAME === expected.USER_NAME &&
            saved?.USER_DESIGNATION === expected.USER_DESIGNATION &&
            String(saved?.USER_ROLE || '').trim().toUpperCase() === expected.USER_ROLE;
        });

        if (!wasSaved) throw saveError;
      }

      return { created: usersToCreate.map(({ password, ...user }) => user), failed };
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to save users to the device.');
      console.error('[userService] Failed to create users:', error instanceof Error ? error.message : message);
      throw new Error(message);
    }
  },

  /** Updates one user using the device's single-user write payload. */
  async updateUser(originalUserId: string, user: Partial<User>): Promise<void> {
    try {
      const { users } = await readConfiguration();
      const entry = Object.entries(users).find(
        ([, value]: [string, any]) => String(value.USER_ID || '').trim().toLowerCase() === originalUserId.trim().toLowerCase()
      );
      if (!entry) throw new Error('User no longer exists on the device.');
      const [, previous] = entry;
      const updatedUser = {
        ...toApiUser(user, previous),
        // The device's user JSON requires this field; an empty value means keep current password.
        USER_PASSWORD: user.password || '',
      };

      const payload = {
        USER_CONFIGURATION: {
          USER_AVAILABLE_COUNT: 0,
          USERS: { U_1: updatedUser },
        },
      };

      try {
        await sendUpdateUserRequest(payload);
      } catch (saveError) {
        // Device firmware may persist the update and still return an error response.
        // Verify fields visible in GET before treating that response as a failed update.
        const savedConfiguration = await readConfiguration().catch(() => null);
        const saved = Object.values(savedConfiguration?.users || {}).find(
          (candidate: any) => String(candidate.USER_ID || '').trim().toLowerCase() === originalUserId.trim().toLowerCase()
        ) as Record<string, any> | undefined;
        const visibleFieldsMatch = Boolean(saved) &&
          saved?.USER_NAME === updatedUser.USER_NAME &&
          saved?.USER_DESIGNATION === updatedUser.USER_DESIGNATION &&
          String(saved?.USER_ROLE || '').trim().toUpperCase() === updatedUser.USER_ROLE;

        // Passwords are omitted by GET, so a password-only update cannot be verified this way.
        if (!visibleFieldsMatch || user.password) throw saveError;
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update user on the device.');
      console.error('[userService] Failed to update user:', error);
      throw new Error(message);
    }
  },

  /**
   * Deletes a user from the device by sending the WHOLE JSON with remaining users.
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { users } = await readConfiguration();
      const matchingKeys = Object.entries(users)
        .filter(([, user]: [string, any]) => String(user.USER_ID || '').trim().toLowerCase() === userId.trim().toLowerCase())
        .map(([key]) => key);
      if (!matchingKeys.length) throw new Error('User no longer exists on the device.');

      // Remove the user while preserving ALL other users in the USERS dictionary
      const updatedUsers: Record<string, any> = { ...users };
      matchingKeys.forEach(k => delete updatedUsers[k]);

      const payload = {
        USER_CONFIGURATION: {
          USER_AVAILABLE_COUNT: 0,
          USERS: updatedUsers,
        },
      };

      await sendSaveUserRequest(payload);
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to delete user from the device.');
      console.error('[userService] Failed to delete user:', error);
      throw new Error(message);
    }
  },
};
