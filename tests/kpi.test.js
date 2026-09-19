const { kpiStatus, sanitizeCode } = require('../engine/kpi-calculator');

describe('KPI Engine Unit Tests', () => {
  test('sanitizeCode normalizes ICD-10 and CPT codes', () => {
    expect(sanitizeCode('E11.9')).toBe('E11.9');
    expect(sanitizeCode('99213')).toBe('99213');
    expect(sanitizeCode('E11.9; DROP TABLE')).toBeNull();
    expect(sanitizeCode('')).toBeNull();
  });

  test('kpiStatus calculates GTE targets correctly', () => {
    expect(kpiStatus(95, { target: 90, target_dir: 'gte' })).toBe('met');
    expect(kpiStatus(85, { target: 90, target_dir: 'gte' })).toBe('near');
    expect(kpiStatus(80, { target: 90, target_dir: 'gte' })).toBe('not-met');
  });

  test('kpiStatus calculates LTE targets correctly', () => {
    expect(kpiStatus(25, { target: 30, target_dir: 'lte' })).toBe('met');
    expect(kpiStatus(32, { target: 30, target_dir: 'lte' })).toBe('near');
    expect(kpiStatus(40, { target: 30, target_dir: 'lte' })).toBe('not-met');
  });
});
