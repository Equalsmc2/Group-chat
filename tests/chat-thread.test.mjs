import test from 'node:test';
import assert from 'node:assert/strict';
import { chatMessageElements, updateChatPerspective } from '../chatThread.js';

class FakeElement {
  constructor(classes = '', sender = '') {
    this.classes = new Set(classes.split(' ').filter(Boolean));
    this.dataset = sender ? { sender } : {};
    this.children = [];
    this.textContent = '';
    this.classList = {
      contains: (c) => this.classes.has(c),
      toggle: (c, force) => { if (force) this.classes.add(c); else this.classes.delete(c); }
    };
  }
  set className(value) { this.classes = new Set(value.split(' ').filter(Boolean)); }
  get className() { return [...this.classes].join(' '); }
  get firstChild() { return this.children[0] || null; }
  querySelector(selector) { return selector === '.sender-name' ? (this.children.find(e => e.classes.has('sender-name')) || null) : null; }
  insertBefore(child) { this.children.unshift(child); child.remove = () => {this.children = this.children.filter(e=>e!==child);}; }
}
const element = () => new FakeElement();

test('decorative empty state is not counted or converted into a message', () => {
  const empty = new FakeElement('terminal-empty');
  const root = {children: [empty]};
  assert.equal(chatMessageElements(root).length, 0);
  updateChatPerspective(root, 'Asya', element);
  assert.equal(empty.className, 'terminal-empty');
  assert.equal(empty.querySelector('.sender-name'), null);
});

test('switching identities only updates real messages and preserves error flags', () => {
  const empty = new FakeElement('terminal-empty');
  const asya = new FakeElement('message message-in anim-slam message-failed', 'Asya');
  const max = new FakeElement('message message-in', 'Max');
  const root = {children: [empty, asya, max]};
  updateChatPerspective(root, 'Asya', element);
  assert.equal(chatMessageElements(root).length, 2);
  assert(asya.classes.has('message-out'));
  assert(asya.classes.has('message-failed'));
  assert(asya.classes.has('anim-slam'));
  assert.equal(asya.querySelector('.sender-name'), null);
  assert.equal(max.querySelector('.sender-name').textContent, 'Max');
  updateChatPerspective(root, 'Max', element);
  assert(max.classes.has('message-out'));
  assert.equal(max.querySelector('.sender-name'), null);
  assert(asya.classes.has('message-in'));
  assert.equal(asya.querySelector('.sender-name').textContent, 'Asya');
  assert.equal(empty.className, 'terminal-empty');
});

test('non-message children and malformed sender-less elements are ignored', () => {
  const root={children:[new FakeElement('terminal-empty'),new FakeElement('message'),new FakeElement('message message-in','Fitz')]};
  assert.deepEqual(chatMessageElements(root).map(e=>e.dataset.sender),['Fitz']);
});
