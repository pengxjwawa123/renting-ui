import { FC } from 'react';
import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback: FC<FallbackProps> = ({error}: FallbackProps) => {
    return (
        <div className='flex flex-col justify-center items-center'>
            <h1 className='text-base'>
                FBI Warning
            </h1>
            <p className='text-sm'>Front-end engineer is working overtime!</p>
            <h2 className='text-lg'>
                <code>{error.message}</code>
            <div>
                <code>{error.stack}</code>
            </div>
            </h2>
        </div>
    )
}