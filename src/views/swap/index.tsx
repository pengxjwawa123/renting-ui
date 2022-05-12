import { FC } from 'react';
import { JupiterProvider } from '@jup-ag/react-hook';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { JupiterForm } from '../../components/JupterForm';
export const SwapView: FC = () => {

  const { connection } = useConnection();

  const { publicKey } = useWallet();
  return (
    <JupiterProvider 
      cluster="mainnet-beta"
      connection={connection}
      userPublicKey={publicKey || undefined}
      // routeCacheDuration={5000}
    >
      <div className="w-full m-0 p-0 min-h-screen min-w-[320px] md:min-w-[400px]">
        <div className="flex flex-col bg-gray-200 justify-between items-center m-auto max-w-screen-2xl ">
          <div className="my-12 p-4 shadow-lg shadow-gray-200 rounded-lg bg-white text-center">
            <h1 className="text-lg font-medium">For smart traders who like money</h1>
          </div>
          <JupiterForm />
        </div>
      </div>
    </JupiterProvider>
  )
}