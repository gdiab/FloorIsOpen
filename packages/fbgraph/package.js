/* 
* @Author: georgediab
* @Date:   2014-06-18 21:08:50
* @Last Modified by:   georgediab
* @Last Modified time: 2014-06-18 21:40:57
* @File: package.js
*/

Package.describe({
    summary: "Facebook fbgraph npm module",
});

Package.on_use(function (api) {
    api.add_files('fbgraph.js', 'server');
});

