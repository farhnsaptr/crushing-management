import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSebangoMasterMap,
  expandSebango,
  normalizeSebango,
  resolveSebango,
} from './sebango.util';

const master = (codes: string[]) => buildSebangoMasterMap(codes, (c) => c);

test('expandSebango', () => {
  assert.deepEqual(expandSebango('U0-3315/6-201B'), [
    'U0-3315-201B',
    'U0-3316-201B',
  ]);
  assert.deepEqual(expandSebango('U0-6136/38-NH696'), [
    'U0-6136-NH696',
    'U0-6138-NH696',
  ]);
  assert.deepEqual(expandSebango('U0-2994/5/6/7-201B'), [
    'U0-2994-201B',
    'U0-2995-201B',
    'U0-2996-201B',
    'U0-2997-201B',
  ]);
  assert.deepEqual(expandSebango('U0-5619/20-BLCK'), [
    'U0-5619-BLCK',
    'U0-5620-BLCK',
  ]);
  assert.deepEqual(expandSebango('U0-1234/5-1-BLCK'), [
    'U0-1234-1-BLCK',
    'U0-1235-1-BLCK',
  ]);
  assert.deepEqual(expandSebango('U0-9901/2/5-201B'), [
    'U0-9901-201B',
    'U0-9902-201B',
    'U0-9905-201B',
  ]);
  assert.deepEqual(expandSebango('U0-4511-R1G3'), ['U0-4511-R1G3']);
});

test('normalizeSebango', () => {
  assert.equal(
    normalizeSebango(' u0-6136/38-nh696(RESIN) '),
    'U0-6136/38-NH696'
  );
  assert.equal(normalizeSebango(null), '');
  assert.equal(
    normalizeSebango('FR T BRAND(I4-D7901-BLCK)'),
    'I4-D7901-BLCK'
  );
  assert.equal(
    normalizeSebango('U0-6136/38-NH696(RESIN)'),
    'U0-6136/38-NH696'
  );
});

test('resolveSebango prefers exact master match', () => {
  const result = resolveSebango('U0-5025/6-202B', master(['U0-5025/6-202B']));
  assert.equal(result.strategy, 'exact');
  assert.deepEqual(result.matched, ['U0-5025/6-202B']);
});

test('resolveSebango expands combined code', () => {
  const result = resolveSebango(
    'U0-3315/6-201B',
    master(['U0-3315-201B', 'U0-3316-201B'])
  );
  assert.equal(result.strategy, 'expanded');
  assert.deepEqual(result.matched, ['U0-3315-201B', 'U0-3316-201B']);
  assert.deepEqual(result.missing, []);
});

test('resolveSebango reports missing expanded code', () => {
  const result = resolveSebango(
    'U0-6136/38-NH696(RESIN)',
    master(['U0-6136-NH696'])
  );
  assert.deepEqual(result.matched, ['U0-6136-NH696']);
  assert.deepEqual(result.missing, ['U0-6138-NH696']);
});

test('resolveSebango reports unregistered code', () => {
  const result = resolveSebango('U0-9999-XXX', master(['U0-3315-201B']));
  assert.equal(result.strategy, 'none');
  assert.deepEqual(result.missing, ['U0-9999-XXX']);
});

test('resolveSebango reports duplicate master key as ambiguous', () => {
  const result = resolveSebango(
    'U0-737-FR',
    master(['U0-737-FR', 'U0-737-FR'])
  );
  assert.equal(result.strategy, 'exact');
  assert.deepEqual(result.matched, []);
  assert.deepEqual(result.ambiguous, ['U0-737-FR']);
});
