const {
  doc: {
    builders: { group, line, concat, indent }
  }
} = require('prettier/standalone');
const comparison = require('./comparison.js');

const groupIfNecessaryBuilder = path => doc => {
  const parentNode = path.getParentNode();
  if (
    parentNode.type === 'BinaryOperation' &&
    !comparison.match(parentNode.operator)
  ) {
    return doc;
  }
  return group(doc);
};

const indentIfNecessaryBuilder = path => doc => {
  let node = path.getNode();
  for (let i = 0; ; i += 1) {
    const parentNode = path.getParentNode(i);
    if (parentNode.type === 'ReturnStatement') return doc;
    if (
      parentNode.type !== 'BinaryOperation' ||
      comparison.match(parentNode.operator)
    ) {
      return indent(doc);
    }
    if (node === parentNode.right) return doc;
    node = parentNode;
  }
};

module.exports = {
  match: op => ['+', '-', '*', '/', '%'].includes(op),
  print: (node, path, print) => {
    const groupIfNecessary = groupIfNecessaryBuilder(path);
    const indentIfNecessary = indentIfNecessaryBuilder(path);

    return groupIfNecessary(
      concat([
        path.call(print, 'left'),
        ' ',
        indentIfNecessary(
          concat([node.operator, line, path.call(print, 'right')])
        )
      ])
    );
  }
};
