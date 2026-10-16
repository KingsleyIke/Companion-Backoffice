import { SnakeNamingStrategy } from './snake-naming.strategy';

describe('SnakeNamingStrategy', () => {
  const strategy = new SnakeNamingStrategy();

  it('snake-cases entity class names into table names', () => {
    expect(strategy.tableName('ParishContact', undefined)).toBe('parish_contact');
  });

  it('keeps an explicit table name', () => {
    expect(strategy.tableName('Parish', 'parish_v2')).toBe('parish_v2');
  });

  it('snake-cases property names into column names', () => {
    expect(strategy.columnName('createdAt', undefined, [])).toBe('created_at');
    expect(strategy.columnName('verificationStatus', undefined, [])).toBe('verification_status');
  });

  it('keeps an explicit column name', () => {
    expect(strategy.columnName('location', 'geo_point', [])).toBe('geo_point');
  });

  it('prefixes embedded columns', () => {
    expect(strategy.columnName('line1', undefined, ['postalAddress'])).toBe('postal_address_line1');
  });

  it('names foreign key columns after the relation', () => {
    expect(strategy.joinColumnName('parentParish', 'id')).toBe('parent_parish_id');
  });
});
