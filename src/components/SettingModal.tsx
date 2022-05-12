import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ReactNode, useCallback, useState } from "react";
import Link from 'next/link';

interface SettingModal {
    children?: ReactNode;
    // OnClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}
export const SettingModal = (props: any) => {
    return (
        <div className="">
            <div className={`${props.open ? 'hidden' : 'flex flex-col' } items-center  absolute w-full top-[64px] right-0 rounded-lg shadow-md shadow-slate-400 p-4 gap-y-2`}>
                <WalletMultiButton />
                <Link href="swap">
                    <a className="p-2 pr-14 pl-14 rounded-md bg-[#512da8] text-white text-base font-bold">Swap</a>
                </Link>
            </div>
        </div>
    )
}
