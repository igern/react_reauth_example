import {AxiosError} from 'axios';
import {useContext} from 'react';
import {Button, Text, View} from 'react-native';
import {AuthContext} from './auth-provider';
import apiClient from './api-client';

function Buttons(): React.JSX.Element {
  const {authState, setAuth} = useContext(AuthContext);

  const authorizedRequest = async () => {
    try {
      await apiClient.get('/private-profiles');
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      } else {
        console.log(error);
      }
    }
  };
  const loginRequest = async () => {
    try {
      const response = await apiClient.post('/auth/email/login', {
        email: 'jonas@littlegiants.dk',
        password: 'secret1234',
      });
      const data = response.data;
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
      } else {
        console.log(error);
      }
    }
  };

  const breakAccessToken = async => {
    setAuth({
      accessToken: 'herger',
      refreshToken: authState.authTokens?.refreshToken,
    });
  };
  const breakRefreshToken = async => {
    setAuth({
      accessToken: authState.authTokens?.accessToken,
      refreshToken: 'fewf',
    });
  };

  return (
    <View>
      <Text>
        {authState != null ? authState?.authTokens?.accessToken : 'there'}
      </Text>
      <Button title="Login request" onPress={loginRequest}></Button>
      <Button title="Reauth request" onPress={authorizedRequest}></Button>
      <Button title="Authorized request" onPress={authorizedRequest}></Button>
      <Button title="Break accesstoken" onPress={breakAccessToken}></Button>
      <Button title="Break refreshToken" onPress={breakRefreshToken}></Button>
    </View>
  );
}

export default Buttons;
