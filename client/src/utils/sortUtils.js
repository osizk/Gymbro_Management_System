export function compareSortValues(aValue, bValue, sortDir = 'asc') {
  let va = aValue ?? '';
  let vb = bValue ?? '';

  const isNumericString = (v) => typeof v === 'number' || (typeof v === 'string' && /^[+-]?(?:\d+|\d+\.\d+|\.\d+)$/.test(v.trim()));

  if (isNumericString(va) && isNumericString(vb)) {
    va = Number(va);
    vb = Number(vb);
  } else if (typeof va === 'string' && typeof vb === 'string') {
    const aDate = Date.parse(va);
    const bDate = Date.parse(vb);
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      va = aDate;
      vb = bDate;
    } else {
      va = va.toLowerCase();
      vb = vb.toLowerCase();
    }
  }

  if (va < vb) return sortDir === 'asc' ? -1 : 1;
  if (va > vb) return sortDir === 'asc' ? 1 : -1;
  return 0;
}
