export function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function harvestEnd(sowDate, daysToMaturity) {
  // Harvest window: maturity date + 21 days of picking
  return addDays(sowDate, daysToMaturity + 21);
}

export function dayOfYear(isoDate) {
  const d = new Date(isoDate);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86400000);
}

export function formatDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function monthLabels(year) {
  return Array.from({ length: 12 }, (_, i) => ({
    label: new Date(year, i, 1).toLocaleString('en-US', { month: 'short' }),
    day: new Date(year, i, 1).toISOString().slice(0, 10),
  }));
}

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
