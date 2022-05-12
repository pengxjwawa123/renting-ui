import { FC } from 'react';
import Link from 'next/link';

export const WalletButton: FC = (props) => {
    return (
        <div>
            <Link href="/renting" replace>
                <a>
                    <button className="btn btn-outline btn-success rounded-lg lg:text-xl">Launch&nbsp;App</button>
                </a>
            </Link>
        </div>
    );    
};