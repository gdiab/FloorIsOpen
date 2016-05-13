/* 
 * @Author: georgediab
 * @Date:   2014-06-29 23:35:21
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-09-19 22:08:04
 * @File: landing.js
 */

Template.landingPage.rendered = function() {
    GAnalytics.pageview("/");
    // $('<meta>', {
    //     property: 'twitter:card',
    //     content: 'summary'
    // }).appendTo('head');
    // $('<meta>', {
    //     property: 'twitter:site',
    //     content: '@floorisopen'
    // }).appendTo('head');
    // $('<meta>', {
    //     property: 'twitter:image',
    //     content: 'http://dev1.openfloor.co/images/openfloor-logo.jpg'
    // }).appendTo('head');
};
