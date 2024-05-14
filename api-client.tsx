import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {AuthTokens} from './auth-provider';

const apiClient = axios.create({
  baseURL: 'https://hotspot-dev.littlegiants.dev',
});

let refreshAuthTokensFunction: Promise<AuthTokens> | undefined;

async function loadAuthTokens(): Promise<AuthTokens | null> {
  const authTokensString = await AsyncStorage.getItem('authTokens');
  if (authTokensString != null) {
    return JSON.parse(authTokensString);
  } else {
    return null;
  }
}

async function refreshAuthTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await axios.post(
    'https://hotspot-dev.littlegiants.dev/auth/refresh-auth-tokens',
    {
      refreshToken: refreshToken,
    },
  );
  return response.data as AuthTokens;
}

apiClient.interceptors.request.use(
  async config => {
    const authTokens = await loadAuthTokens();
    if (authTokens) {
      config.headers.Authorization = `Bearer ${authTokens.accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401) {
      originalRequest._retry = true;

      const authTokens = await loadAuthTokens();

      if (authTokens) {
        try {
          if (!refreshAuthTokensFunction) {
            refreshAuthTokensFunction = refreshAuthTokens(
              authTokens.refreshToken,
            );
          }
          const newAuthTokens = await refreshAuthTokensFunction;

          await AsyncStorage.setItem(
            'authTokens',
            JSON.stringify(newAuthTokens),
          );

          originalRequest.headers.Authorization = `Bearer ${newAuthTokens.accessToken}`;
          return axios(originalRequest);
        } catch (error) {
          // Handle refresh token error or redirect to login
        } finally {
          refreshAuthTokensFunction = undefined;
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
