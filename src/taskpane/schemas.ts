
const types = [
"price", 
"order", 
"trade"
];

const schemamap = {
"price" : [ "sym", "bidpx", "bidsz", "askpx", "asksz", "lastpx", "lastsz" ],
"order" : [ "oid", "sym", "side", "price", "quantity" ],
"trade" : [ "date", "time", "sym", "price", "volume" ]
};

const keymap = {
"price" : "sym",
"order" : "oid",
"trade" : "tid"
};

export function getTypes(): string[] {
    return types;
}

export function getKey(type: string): string {
    return keymap[type];
}

export function getSchema(type: string): string[] {
    return schemamap[type];
}

export function assembleRow(tktype: string, tick: any): any[] {
    var result = [];
    const schema = getSchema(tktype);
    for (let fd of schema) {
        result.push(tick[fd]);
    }
    return result;
}
  