import React, { useCallback, useMemo } from 'react';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletProvider as BaseWalletProvider } from '@solana/wallet-adapter-react';
import {
    MathWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletWalletAdapter,
    SolongWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useConnection } from './ConnectionProvider';
import { useAutoConnect } from '../hooks/useAutoConnect';


export const WalletProvider = ({children}: any) => {

    const { autoConnect } = useAutoConnect();
    
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new SolletWalletAdapter(),
        new SolongWalletAdapter(),
        new MathWalletAdapter(),
    ], []);

    const onError = useCallback((error: WalletError) => {
        //TODO nitify
        console.error(error);
    }, []); 

    return (
        <BaseWalletProvider wallets={wallets} autoConnect={autoConnect} onError={onError}>
            {children}
        </BaseWalletProvider>
    );
}