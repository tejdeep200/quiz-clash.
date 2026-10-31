const fs=require('node:fs');
fs.mkdirSync('dist',{recursive:true});
for(const file of ['index.html','style.css','client.js','engine.js','questions.js','icon.svg'])fs.copyFileSync('public/'+file,'dist/'+file);
fs.writeFileSync('dist/.nojekyll','');
fs.cpSync('public/fonts','dist/fonts',{recursive:true});
console.log('Built six static assets in dist/; no runtime APIs required.');
