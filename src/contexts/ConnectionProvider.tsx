import React, { FC, useMemo, createContext, useContext, ReactNode, useState } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection, Commitment } from '@solana/web3.js';

const NETWORK = WalletAdapterNetwork.Mainnet;
const ENDPOINT = clusterApiUrl(NETWORK);
// const CONNECTION = useMemo(() => new Connection(ENDPOINT, 'confirmed'),[ENDPOINT])

interface ConnectionContextState {
    network?: WalletAdapterNetwork;
    endpoint?: string;
    connection?: Connection;
    config?: Commitment;
}

const ConnectionContext = createContext<ConnectionContextState> ({} as ConnectionContextState);

export function useConnection(): ConnectionContextState {
    return useContext(ConnectionContext);
}

interface ConnectionProviderState extends ConnectionContextState {
    children: ReactNode,
}
export const ConnectionProvider: FC<ConnectionProviderState> = ({
    children,
    endpoint = ENDPOINT,
    config = 'confirmed',
}) => {

    // const [ network, setNetwork ] = useState(WalletAdapterNetwork.Mainnet);
    // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const connection = useMemo(() => new Connection(endpoint, config), [endpoint]);
    return (
        <ConnectionContext.Provider
            value={{
                connection,
            }}
        >
            {children}
        </ConnectionContext.Provider>
    )
}



