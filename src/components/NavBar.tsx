import React, { useState,FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from '../../public/Pisces96.png';
import { WalletMultiButton, WalletModalButton, WalletConnectButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { Button } from '../components/Button';
import { DotsVertical } from '@emotion-icons/heroicons-outline';
import { CogIcon, ChevronDownIcon } from '@heroicons/react/outline'; 
import { Transition, Menu } from '@headlessui/react';
import { SettingModal } from './SettingModal';

export const NavBar: FC = (props) => {

  const [open, setOpen] = useState(true);

  const isOpen = () => {
    setOpen(!open);
  }
  return (
    <div className="w-full m-0 p-0 min-w-[320px]">
      <header className="flex justify-between items-center m-auto max-w-screen-2xl h-16 text-lg tracking-wide ">
        <div className="ml-4">
          <Link href="https://solana.com/">
            <a className="flex items-center">
              <Image className="" src={logo} width={36} height={36}/>
              <span className="hidden md:flex flex-nowrap">&nbsp;Pisces&nbsp;Protocol</span>
            </a>
            </Link>
        </div>
        {/* <div className="lg:hidden flex-nowrap">
          &nbsp;Pisces&nbsp;Protocol
        </div> */}
        <div className="hidden md:flex">
          <Link href="/">
            <a className="pr-9">Home</a>
          </Link>
          <Link href="/swap">
            <a className="pr-9">Swap</a>
          </Link>
          <Link href="/swap">
            <a className="">Market</a>
          </Link>      
        </div>

        
        <div className="">
          {/* <Transition
            show={open}
            enter="transition-all ease-in duration-500"
            enterFrom="opacity-0 transform scale-75"
            enterTo="opacity-100 transform scale-100"
          >
          </Transition> */}
          <div className="hidden md:flex mr-4">
            <WalletMultiButton/>
          </div>
          <Button
            onClick={isOpen}
            className="mr-4 md:hidden"
            startIcon={
              <DotsVertical 
                className={`${open ? 'rotate-[-180] transform duration-200' : 
                  'rotate-180 transform duration-200'}`} 
                size={24}/>} 
            children={""}
              />
          <SettingModal open={open}/>
          {/* <DotsVertical onClick={isOpen} className={`${open ? 'rotate-[-180] transform duration-200' : 'rotate-180 transform duration-200'}`} size={24}/> */}
        </div>
          {/* <CogIcon onClick={isOpen} className={`mr-4 ${open ? 'rotate-[-180] transform duration-200' : 'rotate-180 transform duration-200'}`} height={32} width={32}/> */}
      </header>
    </div>
  )
}
