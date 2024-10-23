const simpleHash = (str: string) => {
    if (str.length === 0) {
        return "0";
    };

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return Math.abs(hash).toString();
};

export const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();

    // Convert the difference to minutes, hours, or days as needed
    const diffInSeconds = Math.round(diffInMs / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);
    const diffInDays = Math.round(diffInHours / 24);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInMinutes) < 60) {
        return rtf.format(diffInMinutes, 'minute');
    } else if (Math.abs(diffInHours) < 24) {
        return rtf.format(diffInHours, 'hour');
    } else {
        return rtf.format(diffInDays, 'day');
    }
};

export const memoFunction = async <T>(fn: () => T | Promise<T>, cacheName: string, cacheKey: string): Promise<T> => {
    const key = simpleHash(`${cacheName}:${cacheKey}`);

    try {
        const existingValue = await localStorage.getItem(key);

        if (existingValue) {
            return JSON.parse(existingValue);
        }
    } catch {
        // skip
    }

    console.log(`Cache miss for '${key}'`);

    const result = await fn();

    localStorage.setItem(key, JSON.stringify(result));

    return result;
};
