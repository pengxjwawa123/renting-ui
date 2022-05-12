import { WalletReadyState } from "@solana/wallet-adapter-base";
import React, { FC, MouseEventHandler } from "react";
import { Wallet } from "../react/useWallet";
import { Button } from './Button';
import { WalletIcon } from './WalletIcon';

export interface WalletItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>
    tabIndex?: number;
    wallet: Wallet;
}

export const WalletListItem: FC<WalletItemProps> = ({ handleClick, tabIndex, wallet }) => {
    return (
        <li>
            <Button
                onClick={handleClick}
                tabIndex={tabIndex}
                startIcon={<WalletIcon wallet={wallet} />}
            >
                {wallet.adapter.name}
                {wallet.readyState === WalletReadyState.Installed && <span>Detected</span>}
            </Button>
        </li>
    )
}