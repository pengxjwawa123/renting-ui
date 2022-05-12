import { WalletModalProvider as BaseWalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletProvider } from '../contexts/WalletProvider';
// import { WalletProvider } from '@solana/wallet-adapter-react';

export const WalletModalProvider = ({children}: any) => {
    return (
        <WalletProvider >
            <BaseWalletModalProvider>
                {children}
            </BaseWalletModalProvider>
        </WalletProvider>
    )
}