
var map: Record<string, number> = {};

export function hasRowKey(key: string): boolean {
    return (key in map);
}

export function setRowKey(key: string, row: number): void {
    map[key] = row;
}

export function getRow(key: string): number {
    if (!hasRowKey(key)) {
        return null;
    }
    return map[key];
}