/* 
* @Author: georgediab
* @Date:   2014-06-24 20:40:24
* @Last Modified by:   georgediab
* @Last Modified time: 2014-06-25 22:10:17
* @File: package.js
*/

Package.describe({
  summary: "Bitly package"
});

Package.on_use(function (api) {
  api.add_files('bitly.js', 'server');
  if(api.export)
    api.export('Bitly');
});