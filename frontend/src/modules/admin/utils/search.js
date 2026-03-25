export const toSearchKey = (value = '') =>
    String(value)
        .toLowerCase()
        .replace(/\s+/g, '');

export const matchesSearch = (source, term) => {
    const query = toSearchKey(term);
    if (!query) return true;
    return toSearchKey(source).includes(query);
};

export const normalizeSearchInput = (value = '') =>
    String(value).replace(/^\s+/, '');
