import classNames from "classnames";

interface SelectProps {
    selectedValue: number | string;
    options: (string | number)[];
    className?: string;
    onChange: (value: number) => void;
}

function Select({ selectedValue, className, options, onChange }: SelectProps) {
    const selectClasses = classNames(
        'px-3 py-1.5 rounded-lg glass-card border border-white/10 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 hover:border-white/20 cursor-pointer truncate',
        className
    );

    return (
        <select
            value={selectedValue}
            className={selectClasses}
            onChange={(e) => onChange(Number(e.target.value))}
        >
            {options.map((option, i) => (
                <option key={i} value={i} className="bg-gray-800 text-white">
                    {option}
                </option>
            ))}
        </select>
    );
}

export default Select;