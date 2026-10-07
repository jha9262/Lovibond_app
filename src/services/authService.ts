import api from './api';
import { LoginRequest, LoginResponse, UserRole } from '../types';

export const authService = {
  /**
   * Sends user credentials to the ESP32 backend for validation using HTTP Basic Auth (Base64).
   * METHOD: GET
   * ENDPOINT: /LOGIN
   * HEADER: Authorization: Basic <base64(USER_ID:PASSWORD)>
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Convert USER_ID:PASSWORD to Base64 (HTTP Basic Authentication)
    const rawCredentials = `${credentials.USER_ID}:${credentials.PASSWORD}`;
    const base64Token = btoa(unescape(encodeURIComponent(rawCredentials)));

    console.log('[authService] Sending GET /LOGIN with HTTP Basic Auth:', {
      USER_ID: credentials.USER_ID,
      Authorization: `Basic ${base64Token}`,
    });

    try {
      const response = await api.get('/LOGIN', {
        headers: {
          'Authorization': `Basic ${base64Token}`,
        },
      });

      let data = response.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          console.warn('[authService] Response data was a plain string:', data);
        }
      }

      console.log('[authService] Login response received:', data);

      if (data && typeof data === 'object') {
        const isSuccess = Boolean(
          data.authenticated === true ||
          data.success === true ||
          data.SUCCESS === true ||
          data.STATUS === 'SUCCESS' ||
          data.status === 'success' ||
          data.STATUS_CODE === 200
        );

        const username = data.user || data.USER || data.USER_ID || data.userId || credentials.USER_ID;
        const displayName = String(data.USER_NAME || data.user_name || data.userName || data.NAME || '').trim();
        let role = String(data.ROLE || data.role || data.USER_ROLE || '').trim().toUpperCase();

        // If role was not returned directly in /LOGIN response, look up from /USER_CONFIGURATION
        if (!role) {
          try {
            const userConfigRes = await api.get('/USER_CONFIGURATION');
            const users = userConfigRes.data?.USER_CONFIGURATION?.USERS;
            if (users && typeof users === 'object') {
              const matched = Object.values(users).find((u: any) =>
                String(u?.USER_ID || '').trim().toLowerCase() === String(username).trim().toLowerCase()
              ) as any;
              if (matched?.ROLE || matched?.role || matched?.USER_ROLE) {
                role = String(matched.ROLE || matched.role || matched.USER_ROLE).trim().toUpperCase();
              }
            }
          } catch (lookupErr) {
            console.warn('[authService] Could not lookup user role from USER_CONFIGURATION:', lookupErr);
          }
        }

        if (!role) {
          role = String(username).toLowerCase().includes('master')
            ? 'MASTER'
            : (String(username).toLowerCase().includes('admin') ? 'ADMIN' : 'USER');
        }

        return {
          success: isSuccess,
          message: data.message || data.MESSAGE || (isSuccess ? 'Login successful' : 'Invalid User ID or Password'),
          USER_ID: username,
          USER_NAME: displayName || username,
          ROLE: role,
        };
      }

      // If status 200 OK was returned without json error, check /USER_CONFIGURATION for role
      let fallbackRole = credentials.USER_ID.toLowerCase().includes('master')
        ? 'MASTER'
        : (credentials.USER_ID.toLowerCase().includes('admin') ? 'ADMIN' : 'USER');

      try {
        const userConfigRes = await api.get('/USER_CONFIGURATION');
        const users = userConfigRes.data?.USER_CONFIGURATION?.USERS;
        if (users && typeof users === 'object') {
          const matched = Object.values(users).find((u: any) =>
            String(u?.USER_ID || '').trim().toLowerCase() === String(credentials.USER_ID).trim().toLowerCase()
          ) as any;
          if (matched?.ROLE || matched?.role || matched?.USER_ROLE) {
            fallbackRole = String(matched.ROLE || matched.role || matched.USER_ROLE).trim().toUpperCase();
          }
        }
      } catch (e) {
        // Keep fallbackRole
      }

      return {
        success: true,
        message: 'Login successful',
        USER_ID: credentials.USER_ID,
        USER_NAME: credentials.USER_ID,
        ROLE: fallbackRole,
      };
    } catch (error: any) {
      console.error('[authService] Login request failed:', error);

      // Handle server error responses (e.g., 400, 401, 403, 500)
      let respData = error.response?.data;
      if (typeof respData === 'string') {
        try {
          respData = JSON.parse(respData);
        } catch {
          // Keep raw string
        }
      }

      if (respData && typeof respData === 'object') {
        return {
          success: false,
          message: respData.message || respData.MESSAGE || (respData.authenticated === false ? 'Invalid User ID or Password' : 'Login failed'),
          USER_ID: respData.USER_ID || respData.user,
        };
      }

      if (typeof respData === 'string' && respData.trim().length > 0) {
        return {
          success: false,
          message: respData,
        };
      }

      // Check HTTP status code fallback
      const status = error.response?.status;
      if (status === 401 || status === 400 || status === 403) {
        return {
          success: false,
          message: 'Invalid User ID or Password',
        };
      }

      return {
        success: false,
        message: error.message || 'Unable to connect to device. Please check connection.',
      };
    }
  },
};

export default authService;
