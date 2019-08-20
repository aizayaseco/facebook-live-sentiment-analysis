'use strict';

const importer = require('anytv-node-importer');

module.exports = (router) => {
	const __ = importer.dirloadSync(__dirname + '/../controller');

	// __.controller.init(); training of data
	//router.del = router.delete;

	router.get('/', __.controller.hello); 					//checking if the server is up and running
	router.get('/token',__.controller.token);				//getting of access token
	router.post('/svm', __.controller.svm); 				//API to classify the chat message using Support Vector Machine

	return router;
}