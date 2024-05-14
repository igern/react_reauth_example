import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext, useEffect, useState} from 'react';

type AuthTokens = {accessToken: string; refreshToken: string};
type Authenticated = {authTokens: AuthTokens};
type Unauthenticated = {};
type AuthState = Authenticated | Unauthenticated;

const AuthContext = createContext({});
const AuthProvider = ({children}: {children: any}) => {
  const [authState, setAuthState] = useState<AuthState>({});

  const getAuthState = async () => {
    const authTokensString = await AsyncStorage.getItem('authTokens');
    if (authTokensString != null) {
      setAuthState({authTokens: JSON.parse(authTokensString)});
    } else {
    }
    return authState;
  };

  const setAuth = async (authTokens: AuthTokens) => {
    setAuthState(authTokens);
    await AsyncStorage.setItem('authTokens', JSON.stringify(authTokens));
  };

  useEffect(() => {
    getAuthState();
  });

  return (
    <AuthContext.Provider value={{authState, setAuth}}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
export type {AuthTokens};
