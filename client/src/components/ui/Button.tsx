import type { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}

function Button({
    children,
    className,
    color = 'primary',
    size = 'md',
    disabled,
    ...props
}: ButtonProps) {
    const buttonClasses = classNames(
        'cursor-pointer disabled:cursor-not-allowed text-center font-medium focus:ring-4 focus:outline-none flex items-center justify-center rounded-lg',
        {
            'bg-cta-300 focus:ring-cta-400 text-black border-cta': color === 'primary' && !disabled,
            '!bg-gray-700 text-gray-400': color === 'primary' && disabled,
            'bg-background focus:ring-gray-400 border border-foreground-secondary': color === 'secondary',
            'h-8 px-4 text-xs': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-12 px-6 text-lg': size === 'lg'
        },
        className
    );

    return (
        <button className={buttonClasses} disabled={disabled} {...props}>
            {children}
        </button>
    );
}

export default Button;