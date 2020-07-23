
var map = {};

export function hasRowKey(key) {
    return (key in map);
}

export function setRowKey(key, row) {
    map[key] = row;
}

export function getRow(key) {
    if (!hasRowKey(key)) {
        return null;
    }
    return map[key];
}