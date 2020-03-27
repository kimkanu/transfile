export function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}
