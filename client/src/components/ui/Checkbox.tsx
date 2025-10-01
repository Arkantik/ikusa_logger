import { InputHTMLAttributes } from 'react';
import classNames from 'classnames';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    checked: boolean;
}

export function Checkbox({ checked, className, ...props }: CheckboxProps) {
    const checkboxClasses = classNames(
        'text-gold focus:ring-gold w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 mr-2 dark:bg-gray-700 dark:border-gray-600 rounded',
        className
    );

    return (
        <input
            type="checkbox"
            checked={checked}
            className={checkboxClasses}
            {...props}
        />
    );
}

export default Checkbox;