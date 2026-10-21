/* V36.1 — message-only DOM operations.
   Decorative thread children are not messages and must never be reclassified. */
export function chatMessageElements(container) {
  return Array.from(container?.children || []).filter(element =>
    element.classList?.contains('message') && Boolean(element.dataset?.sender));
}

export function updateChatPerspective(container, currentUser, createElement = tag => document.createElement(tag)) {
  for (const message of chatMessageElements(container)) {
    const sender = message.dataset.sender;
    const ownMessage = sender === currentUser;
    // Preserve unrelated flags, particularly failed-send feedback and animations.
    message.classList.toggle('message-out', ownMessage);
    message.classList.toggle('message-in', !ownMessage);
    let label = message.querySelector('.sender-name');
    if (ownMessage && label) label.remove();
    if (!ownMessage && !label) {
      label = createElement('div');
      label.className = 'sender-name';
      label.textContent = sender;
      message.insertBefore(label, message.firstChild);
    }
  }
}
