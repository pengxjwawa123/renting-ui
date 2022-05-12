import { FC, ReactNode, ReactElement, CSSProperties } from 'react';

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    startIcon?: ReactElement;
    endIcon?: ReactElement;
    style?: CSSProperties;
    tabIndex?: number;
}

export const Button: FC<ButtonProps> = ({
    children,
    onClick,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`whitespace-nowrap ${className}`}
            tabIndex={props.tabIndex}
            type="button"
        >
            {props.startIcon && <i className="pr-1">{props.startIcon}</i>}
            {children}
            {props.endIcon && <i className="pl-1">{props.endIcon}</i>}
        </button>
    );
}
