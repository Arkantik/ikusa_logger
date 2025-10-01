import classNames from "classnames";

interface SelectProps {
    selectedValue: number | string;
    options: (string | number)[];
    className?: string;
    onChange: (value: number) => void;
}

function Select({ selectedValue, className, options, onChange }: SelectProps) {
    const selectClasses = classNames(
        'w-20 p-1 rounded-md ring-cta truncate bg-background-secondary text-white border border-gray-600',
        className
    );
    return (
        <select
            value={selectedValue}
            className={selectClasses}
            onChange={(e) => onChange(Number(e.target.value))}
        >
            {options.map((option, i) => (
                <option key={i} value={i} className="rounded-lg text-gray-800 bg-gray-300">
                    {option}
                </option>
            ))}
        </select>
    );
}

export default Select;