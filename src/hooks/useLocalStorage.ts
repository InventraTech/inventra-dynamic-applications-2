import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
    const [value, setValue] = useState<T>(() => {
        const save = localStorage.getItem(key);
        if (save) {
            return JSON.parse(save) as T;
        };

        return defaultValue; 
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value])

    return [value, setValue] as const;
}