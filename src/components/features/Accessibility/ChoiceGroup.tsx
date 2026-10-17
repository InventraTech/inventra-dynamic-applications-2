import type { ChoiceOption } from "../../../types/accessibility";

interface ChoiceGroupProps<T extends string | number> {
    name: string;
    label: string;
    value: T;
    options: ChoiceOption<T>[];
    onChange: (value: T) => void;
    columns?: 2 | 3 | 4;
}

const columnClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
} as const;

function ChoiceGroup<T extends string | number>({
    name,
    label,
    value,
    options,
    onChange,
    columns = 3,
}: ChoiceGroupProps<T>) {
    return (
        <fieldset className="min-w-0">
            <legend className="mb-2 font-k2d text-xs font-semibold text-sidebar-label">{label}</legend>
            <div className={`grid gap-2 large-text:grid-cols-1 ${columnClasses[columns]}`}>
                {options.map((option) => {
                    const selected = value === option.value;
                    const optionId = `${name}-${String(option.value)}`;

                    return (
                        <label
                            key={optionId}
                            htmlFor={optionId}
                            className={`flex min-h-11 min-w-0 cursor-pointer items-center justify-center rounded-xl border px-2.5 py-2 text-center font-k2d text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sidebar-purple ${
                                selected
                                    ? "border-sidebar-purple bg-sidebar-active font-bold text-sidebar-purple"
                                    : "border-history-border bg-surface text-sidebar-text hover:border-sidebar-divider"
                            }`}
                        >
                            <input
                                id={optionId}
                                className="sr-only"
                                type="radio"
                                name={name}
                                value={String(option.value)}
                                checked={selected}
                                onChange={() => onChange(option.value)}
                            />
                            <span className="min-w-0">
                                <span className="block">{option.label}</span>
                                {option.description && <span className="mt-0.5 block text-xs font-normal text-history-muted">{option.description}</span>}
                            </span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

export default ChoiceGroup;
