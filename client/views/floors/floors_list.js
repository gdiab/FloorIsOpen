/* 
 * @Author: georgediab
 * @Date:   2014-05-23 01:09:14
 * @Last Modified by:   georgediab
 * @Last Modified time: 2014-10-02 17:33:46
 * @File: floors_list.js
 */

Session.set('eventFloorId', '');

Template.floorsList.helpers({
    floorsWithRank: function() {
        //if (!this.floors) return;
        this.floors.rewind();

        //console.log('rewinding');
        //this.floors = Floors.find({}, {'limit': Session.get('floorPaging')});
        return this.floors.map(function(floor, index, cursor) {
            floor._rank = index;
            return floor;
        });
    }
});
