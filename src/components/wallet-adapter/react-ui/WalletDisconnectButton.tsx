import { WalletIcon } from '@solana/wallet-adapter-react-ui';
import React, { FC, MouseEventHandler, useCallback, useMemo } from 'react';
import { useWallet } from '../react/useWallet';
import { Button, ButtonProps } from './Button';

export const WalletDisconnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props}) => {
    const { wallet, disconnecting, disconnect } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) disconnect().catch(() => {});
    }, [onClick, disconnect]);

    const content = useMemo(() => {
        if (children) return children;
        if (disconnecting) return 'Disconnecting ...';
        if (wallet) return 'Disconnect';
        return 'Disconnect Wallet';
    }, [children, disconnecting, wallet]);

    return (
        <Button
        className='wallet-adapter-button-btigger'
        disabled={disabled || !wallet}
        startIcon={wallet ? <WalletIcon wallet={wallet}/> : undefined}
        onClick={handleClick}
        >
            {content}
        </Button> 
    )
}