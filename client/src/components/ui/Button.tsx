import type { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    color?: 'primary' | 'secondary' | 'outline' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
}

function Button({
    children,
    className,
    color = 'primary',
    size = 'sm',
    disabled,
    ...props
}: ButtonProps) {
    const buttonClasses = classNames(
        'cursor-pointer disabled:cursor-not-allowed text-center font-medium focus:ring-2 focus:outline-none flex items-center justify-center rounded-xl duration-300 transition-all',
        {
            // Gradient primary button
            'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-sm hover:shadow-md glow-effect':
                color === 'primary' && !disabled,
            '!bg-gray-700 text-gray-400 shadow-none':
                color === 'primary' && disabled,

            // Glass secondary button
            'glass-card glass-card-hover text-white border border-white/10':
                color === 'secondary',

            // Outline button
            'bg-transparent border-2 border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10 text-purple-400':
                color === 'outline',

            // Gold gradient button
            'bg-gradient-to-r from-cta-500 to-orange-500 hover:from-cta-600 hover:to-orange-600 text-gray-900 shadow-sm hover:shadow-mg glow-effect-cta':
                color === 'gradient' && !disabled,

            'h-8 px-4 text-xs': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg'
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