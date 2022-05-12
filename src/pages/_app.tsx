import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../components/ErrorFallback';
import { Footer } from '../components/Footer';
// import { ConnectionProvider } from '../contexts/ConnectionProvider';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
// import { WalletProvider } from '../contexts/WalletProvider';
import { WalletModalProvider } from '../contexts/WalletModalProvider';
import { ThemeProvider } from 'next-themes';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Commitment } from '@solana/web3.js';
import '../styles/globals.css';
import { NavBar } from '../components/NavBar';



function MyApp({ Component, pageProps }: AppProps) {

    // const network = WalletAdapterNetwork.Mainnet;
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // const [config, setConfig] = useSxtate<Commitment>('confirmed');
    const endpoint = useMemo(() => "https://ssc-dao.genesysgo.net/", []);

    return (
        <div>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <ThemeProvider>
                    <ConnectionProvider endpoint={endpoint}>
                        <WalletModalProvider>
                            <NavBar />
                            <Component {...pageProps} />
                            <Footer />
                        </WalletModalProvider>
                    </ConnectionProvider>
                </ThemeProvider>
            </ErrorBoundary>
        </div>
    )

}

export default MyApp
