interface SelectProps {
    selectedValue: number | string;
    options: (string | number)[];
    onChange: (value: number) => void;
}

function Select({ selectedValue, options, onChange }: SelectProps) {
    return (
        <select
            value={selectedValue}
            className="!w-32 p-1 rounded-lg !ring-gold truncate"
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