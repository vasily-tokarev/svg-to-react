const fs = require('fs');
const parseString = require('xml2js').parseString;
const chokidar = require('chokidar');

process.chdir('/Users/vt/Desktop/Icons/');

const replaceAt = (str, char, index) => {
  const a = str.split('');
  a[index] = char;
  return a.join('');
};

const transformedProp = (prop) => {
  let data = '';
  const splitted = prop.split(':');
  for (i = 0; i < splitted.length; i += 2) {
    let name = splitted[i];
    if (name) {
      const hyphen = name.match('-');
      let value = splitted[i + 1];
      const matchedQuotes = value.match(/'(.*)'/);
      if (hyphen) {
        lowercaseIndex = hyphen.index + 1;
        lowercase = name[lowercaseIndex];
        name = replaceAt(name, lowercase.toUpperCase(), lowercaseIndex).replace('-', '');
      }

      // Inherit color from CSS.
      if (name === 'fill' || name === 'stroke') {
        if (value != 'none') value = 'currentColor';
      }
      data += `${name}: '${matchedQuotes ? matchedQuotes[1] : value}'`;
    }
    return data;
  }
};

const withoutCommas = (str) => str.replace(',', '');
const I = (identity) => identity;

const path = (node) => {
  let data = '';
  data += `<path \nd="${node.$.d}"`;
  if (node.$.style) {
    data += '\n style={{\n';
    data += transformedStyles(node.$.style.split(';'));
    data += '}}\n/>';
  }
  return data;
};

const transformedStyles = (node) => {
  let data = '';
  node.filter(I)
    .map(withoutCommas)
    .map(transformedProp)
    .forEach((style) => data += `${style},\n`);
  return data;
};

const group = (node) => {
  let data = `\n<g`;
  node.$ && node.$.transform ? data += ` transform="${node.$.transform}">` : data += '>';
  if (node.path) {
    node.path.map(path).forEach((res) => {
      data += `${res}\n`
    });
  }
  return data += `\n</g>`;
};

const text = (node) => {
  let data = `<text\nx="${node.$.x}"\ny="${node.$.y}"`;
  if (node.$.style) {
    data += '\nstyle={{\n';
    data += transformedStyles(node.$.style.split(';'));
    data += '}}\n';
  }
  data += `>\n${node._}\n</text>`;
  return data;
};

const processSvg = (file) => {
  let output = '';
  output += 'import React from \'react\';\n\nexport default () => (\n';

  parseString(fs.readFileSync(file), (err, xml) => {
    // Use only px for export.
    const width = xml.svg.$.width.replace('px', '');
    const height = xml.svg.$.height.replace('px', '');
    output += `<svg height="${height / 16}em" width="${height / 16}em" viewBox="0 0 ${width} ${height}"> \n`;

    if (xml.svg.text) {
      output += xml.svg.text.map(text);
    }

    if (xml.svg.g) {
      output += xml.svg.g.map(group);
    } else {
      if (xml.svg.path) {
        output += xml.svg.path.map(path);
      }
    }
    output += '\n</svg>';
    output += '\n);';
    // pbcopy(output) // Copy to clipboard.
    fs.writeFileSync('/Users/vt/Desktop/Representer/app/containers/Header/TestIcon.js', output);
  });
};

const pbcopy = (data) => {
  const proc = require('child_process').spawn('pbcopy');
  proc.stdin.write(data);
  proc.stdin.end();
};
// processSvg('question.svg'); // Test single file.

chokidar.watch('*.svg')
  .on('add', path => processSvg(path))
  .on('change', path => processSvg(path));
