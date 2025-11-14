import { ApolloProvider } from '@apollo/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
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
  const client = useApollo(pageProps.initialApolloState);

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
        <Component {...pageProps} />
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default appWithTranslation(App);
