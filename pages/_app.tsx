import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useApollo } from '../apollo/client';
import CustomCursor from '../libs/components/common/CustomCursor';
import { useDarkMode } from '../libs/hooks/useDarkMode';
import '../scss/app.scss';
import { dark, light } from '../scss/MaterialTheme';
import '../scss/mobile/main.scss';
import '../scss/pc/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
  const { isDarkMode } = useDarkMode();
  // @ts-ignore
  const [theme, setTheme] = useState(createTheme(light));
  const [mounted, setMounted] = useState(false);
  const client = useApollo(pageProps.initialApolloState);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // @ts-ignore
    setTheme(createTheme(isDarkMode ? dark : light));
  }, [isDarkMode]);

  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <Head>
          <title>HIGHLAND</title>
        </Head>
        <CssBaseline />
        <CustomCursor />
        {mounted && (
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: isDarkMode ? '#1e2128' : '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 3000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        )}
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default appWithTranslation(App);
