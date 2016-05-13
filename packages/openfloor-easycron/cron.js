

/** recursive function for scheduling the timeouts */
function sched(fn) {

    console.log("will run again in 30 seconds...");

    Meteor.setTimeout(
        function() {
            fn();
            sched(fn);
        }, 
        30000
    );

}

Cron = function(fn) {
    sched(fn);
};
