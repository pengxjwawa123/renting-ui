import { WalletAdapterEvents } from '@solana/wallet-adapter-base';
import { Connection, ConnectionConfig, PublicKey, SendOptions, Signer, Transaction, TransactionSignature } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { WalletError } from './errors';

export enum WalletReadyState {
    Installed = 'Installed',
    NotDetected = 'NotDetected',
    Loadable = 'Loadable',
    Unsupported = 'Unsupported',
}

export interface WalleAdapterEvents {
    connect(publicKey: PublicKey): void;
    disconnect(): void;
    error(error: WalletError): void;
    readyStateChange(readyState: WalletReadyState): void;
}

export interface SendTransactionOptions extends SendOptions {
    signers?: Signer[];
}

export type WalletName<T extends string = string> = T & {__brand__: 'WalletName'};

export interface WalletAdapterProps<Name extends string = string> {
    name: WalletName<Name>;
    url: string;
    icon: string;
    readyState: WalletReadyState;
    publicKey: PublicKey | null;
    connecting: boolean;
    connected: boolean;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions,
    ): Promise<TransactionSignature>;
}

export type WalletAdapter<Name extends string = string> = WalletAdapterProps & EventEmitter<WalletAdapterEvents>;

export abstract class BaseWalletAdapter extends EventEmitter<WalletAdapterEvents> implements WalletAdapter {
    abstract name: WalletName;
    abstract url: string;
    abstract icon: string;
    abstract readyState: WalletReadyState;
    abstract publicKey: PublicKey;
    abstract connecting: boolean;

    get connected(): boolean {
        return !!this.publicKey;
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Promise<TransactionSignature>;
}

export function scopePollingDetectionStrategy(detect: () => boolean): void {

    if(typeof window === 'undefined' || typeof document === 'undefined') return;

    const disposers: (() => void)[] = [];

    function detectAndDispose() {
        const detected = detect();
        if(detected) {
            for(const dispose of disposers) {
                dispose();
            }
        }
    }
    const interval = setInterval(detectAndDispose, 1000);

    disposers.push(() => clearInterval(interval));

    if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndDispose, { once: true });
        disposers.push(() => document.removeEventListener('DOMContentLoaded', detectAndDispose));
    }

    if(document.readyState === 'complete') {
        window.addEventListener('load', detectAndDispose, { once: true });
        disposers.push(() => document.removeEventListener);
    }

    detectAndDispose();
}