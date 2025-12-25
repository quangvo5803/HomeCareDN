/**
 * @param {string|Date} dateInput
 * @returns {Date}
 */
export function parseUtc(dateInput) {
    if (!dateInput) return new Date(NaN);

    if (dateInput instanceof Date) return dateInput;

    let s = dateInput;

    // Nếu BE không trả timezone → ép UTC
    if (typeof s === 'string' && !s.endsWith('Z') && !s.includes('+')) {
        s = s + 'Z';
    }

    return new Date(s);
}
