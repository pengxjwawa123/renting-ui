import React, { createContext, useContext } from 'react';

interface AutoConnectContextState {
    autoConnect: boolean;
    setAutoConnect(autoConnect: boolean): void;
}

const AutoConnnetContext = createContext<AutoConnectContextState>({} as AutoConnectContextState);

export function useAutoConnect() {
    return useContext(AutoConnnetContext);
}