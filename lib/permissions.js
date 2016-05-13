//permissions.js - George Diab - Fri Jun  6 13:51:41 2014

// check that the userId specified owns the documents

ownsDocument = function(userId, doc) {
	return doc && doc.userId === userId;
}