import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt_auth_token';

export async function setToken(token: string): Promise<void> {
    if (!token) {
        console.warn('setToken received an empty or undefined token.');
        return;
    }
    const tokenStr = typeof token === 'string' ? token : JSON.stringify(token);
    try {
        await AsyncStorage.setItem(TOKEN_KEY, tokenStr);
    } catch (e) {
        console.error('Failed to save token to AsyncStorage', e);
    }
}

export async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
        console.error('Failed to fetch token from AsyncStorage', e);
        return null;
    }
}

export async function clearToken(): Promise<void> {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
        console.error('Failed to remove token from AsyncStorage', e);
    }
}