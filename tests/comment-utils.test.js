import test from 'node:test';
import assert from 'node:assert/strict';
import { pickApprovedComments, isValidComment, pickVisibleComments } from '../public/assets/js/comment-utils.js';

test('pickApprovedComments returns up to 4 unique approved comments', () => {
  const comments = [
    { id: 1, status: 'approved', text: 'a' },
    { id: 2, status: 'approved', text: 'b' },
    { id: 3, status: 'approved', text: 'c' },
    { id: 4, status: 'approved', text: 'd' },
    { id: 5, status: 'approved', text: 'e' },
    { id: 6, status: 'pending', text: 'f' },
    { id: 7, status: 'rejected', text: 'g' },
  ];

  const selected = pickApprovedComments(comments, 4);
  assert.equal(selected.length, 4);
  assert.equal(new Set(selected.map(({ id }) => id)).size, 4);
  selected.forEach((comment) => assert.equal(comment.status, 'approved'));
});

test('pickApprovedComments returns all available approved comments when fewer than 4 exist', () => {
  const comments = [
    { id: 1, status: 'approved', text: 'a' },
    { id: 2, status: 'approved', text: 'b' },
  ];

  assert.deepEqual(pickApprovedComments(comments, 4).map(({ id }) => id), [1, 2]);
});

test('pickVisibleComments keeps at most 5 approved comments for the first display', () => {
  const comments = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    status: 'approved',
    text: `comment-${index + 1}`,
  }));

  const visible = pickVisibleComments(comments, 5);
  assert.equal(visible.length, 5);
  visible.forEach((comment) => assert.equal(comment.status, 'approved'));
});

test('isValidComment rejects blank content', () => {
  assert.equal(isValidComment('   '), false);
  assert.equal(isValidComment('Bonjour COTEC'), true);
});
