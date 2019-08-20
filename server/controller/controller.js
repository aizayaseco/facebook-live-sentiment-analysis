'use strict';

const config 	= require(__dirname + '/../config/config');
const fs 		= require('fs');
const pyShell = require('python-shell');
const access_tokens = [
	/*insert valid access tokens here*/
]; //various access tokens to reduce api rate limiting

const N= 5;
var counter=-1;
var options 	= {
  	  mode: 'json',
  	  pythonPath: '/usr/bin/python2',
  	  pythonOptions: ['-u'],
  	  scriptPath: '/mnt/c/Users/Aya/Desktop/facebook-comment-emotion-analyzer-master/server/controller/',
	};


exports.hello = (req, res, next) => {
	return res.send({message: 'FB Emotion Analyzer server is up!'});
}

exports.token = (req, res, next) => {
	if(counter<N)
		counter+=1;
	else
		counter=0;
	return res.send({access_token: access_tokens[counter]});
}

//do svm Analysis only 
exports.svm = (req, res, next) => {
	var data=null;
	options.args = req.body.data; //limit size of arguments
	console.log(options.args);
	pyShell.run('test.py', options, function (err, results) {
	    if (err) 
	    	throw err;

		delete options.args;
	    console.log("RESULTS")
		console.log(results);
		res.send(results[0]);
	});
}
