![Example](https://github.com/vasily-tokarev/svg-to-react/raw/master/example.gif)

SVG to React filewatcher.

1. Change default directory:
```javascript
process.chdir('/Users/vt/Desktop/Icons/');
```
2. Change output path:
```javascript
fs.writeFileSync('/Users/vt/Desktop/Representer/app/containers/Header/TestIcon.js', output);
```
3. Create 16x16 px document with transparent background in Affinity Designer and set continuous SVG export.  
4. Import the icon in your React project.  

SVG size is set to match 1em (16px) by default. E.g. 32x32 document will output 2em SVG.


