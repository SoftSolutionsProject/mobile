import Constants from 'expo-constants';

type ExtraConfig = {
  apiUrl?: string;
  alternativeUrls?: string[];
  production?: boolean;
};

declare const process: any;

const resolveApiUrl = () => {
  const extra = (Constants?.expoConfig?.extra ||
    Constants?.manifest?.extra ||
    {}) as ExtraConfig;

  const envApiUrl =
    (typeof process !== 'undefined' &&
      process?.env?.EXPO_PUBLIC_API_URL &&
      String(process.env.EXPO_PUBLIC_API_URL)) ||
    undefined;

  return (
    envApiUrl ||
    extra.apiUrl ||
    'https://api-softsolutions.onrender.com'
  );
};

const resolveAlternativeUrls = (primaryUrl: string) => {
  const extra = (Constants?.expoConfig?.extra ||
    Constants?.manifest?.extra ||
    {}) as ExtraConfig;

  const defaults = [
    primaryUrl,
    'https://api-softsolutions.onrender.com',
    'http://localhost:4000',
    'http://10.0.2.2:4000',
  ];

  const rawList = extra.alternativeUrls || defaults;
  const unique = Array.from(new Set(rawList.filter(Boolean)));

  return unique;
};

const apiUrl = resolveApiUrl();

export const environment = {
  production:
    (Constants?.expoConfig as any)?.runtimeVersion
      ? true
      : Boolean(
          (Constants?.expoConfig?.extra as ExtraConfig | undefined)?.production
        ),
  apiUrl,
  alternativeUrls: resolveAlternativeUrls(apiUrl),
};
