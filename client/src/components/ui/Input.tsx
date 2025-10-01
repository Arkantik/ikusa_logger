import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import classNames from 'classnames';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, size = 'md', type = 'text', ...props }, ref) => {
        const inputClasses = classNames(
            'outline-none block disabled:cursor-not-allowed disabled:opacity-50 border focus:!border-foreground focus:!ring-foreborder-foreground bg-background text-white placeholder-gray-400 border-foreground rounded-lg',
            {
                'py-1.5 px-2 text-xs': size === 'sm',
                'p-2.5 text-sm': size === 'md',
                'py-3 px-4': size === 'lg'
            },
            className
        );

        return <input ref={ref} type={type} className={inputClasses} {...props} />;
    }
);

Input.displayName = 'Input';

export default Input;