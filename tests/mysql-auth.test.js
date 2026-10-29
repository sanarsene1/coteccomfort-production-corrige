import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../lib/auth.js';

test('hashPassword and verifyPassword work together', async () => {
  const password = 'MotDePasse123!';
  const result = await hashPassword(password);

  assert.equal(typeof result.hash, 'string');
  assert.equal(typeof result.salt, 'string');
  assert.equal(result.hash.length > 20, true);
  assert.equal(await verifyPassword(password, result.hash, result.salt), true);
  assert.equal(await verifyPassword('wrong-password', result.hash, result.salt), false);
});
