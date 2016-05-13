/* 
* @Author: georgediab
* @Date:   2014-07-22 09:46:29
* @Last Modified by:   georgediab
* @Last Modified time: 2014-07-22 09:46:53
* @File: about.js
*/

Template.about.helpers({
    activeRouteClass: function( /* route names*/ ) {
        var args = Array.prototype.slice.call(arguments, 0);
        args.pop();
        var active = _.any(args, function(name) {
            return Router.current() && Router.current().route.name === name
        });

        return active && 'active';
    }
});
