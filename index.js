const fs = require('fs');
const parseString = require('xml2js').parseString;
const chokidar = require('chokidar');

process.chdir('/Users/vt/Desktop/Icons/');

const replaceAt = (str, char, index) => {
  const a = str.split('');
  a[index] = char;
  return a.join('');
};

const parsePath = (node) => {
  let path = '';
  path += `<path \nd="${node.$.d}"`;
  if (node.$.style) {
    path += '\n style={{\n';
    node.$.style.split(';').forEach((prop) => {
      const splitted = prop.split(':');
      for (i = 0; i < splitted.length; i += 2) {
        let val = splitted[i];
        if (val) {
          const hyphen = val.match('-');
          if (hyphen) {
            lowercaseIndex = hyphen.index + 1;
            lowercase = val[lowercaseIndex];
            val = replaceAt(val, lowercase.toUpperCase(), lowercaseIndex).replace('-', '');
          }
          path += `${val}: '${splitted[i + 1]}',\n`;
        }
      }
      ;
    });
    path += '}}\n/>';
  }
  return path;
};

const parseGroup = (node) => {
    let group = `\n<g`;
    node.$ && node.$.transform ? group += ` transform="${node.$.transform}">` : group += '>';
    if (node.path) {
      group += node.path.map(parsePath);
    }
    group += `\n</g>`;
    return group;
}

const processSvg = (file) => {
  let output = '';
  output += 'import React from \'react\';\n\nexport default () => (\n';

  parseString(fs.readFileSync(file), (err, xml) => {
    // Use only px for export.
    const width = xml.svg.$.width.replace('px', '');
    const height = xml.svg.$.height.replace('px', '');
    output += `<svg height="${height / 16}em" width="${height / 16}em" viewBox="0 0 ${width} ${height}"> \n`;

    if (xml.svg.g) {
      output += xml.svg.g.map(parseGroup)
    } else {
      if (xml.svg.path) {
        output += xml.svg.path.map(parsePath);
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
// processSvg('test-icon.svg'); // Test single file.

chokidar.watch('.', { ignored: '.DS_Store' })
  .on('add', path => processSvg(path))
  .on('change', path => processSvg(path));
