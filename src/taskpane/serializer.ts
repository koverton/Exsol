
export function deserialize(payload: string): any {
    return JSON.parse(payload);
}

export function serialize(obj: object): string {
    return JSON.stringify(obj);
}