"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDays = addDays;
exports.isPast = isPast;
exports.formatISODate = formatISODate;
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function isPast(date) {
    return new Date().getTime() > new Date(date).getTime();
}
function formatISODate(date = new Date()) {
    return date.toISOString().split('T')[0];
}
