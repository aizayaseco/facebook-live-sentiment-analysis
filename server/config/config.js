'use strict';
const fs 		= require('fs');
//contains the constants used by the web application
module.exports = {
	PORT: 8000,
	IP: '127.0.0.1',
	SSL_KEY: fs.readFileSync('/mnt/c/Users/Aya/Desktop/facebook-comment-emotion-analyzer-master/server/cert/localhost.key'), 	//path of the SSL Key
	SSL_CERT: fs.readFileSync('/mnt/c/Users/Aya/Desktop/facebook-comment-emotion-analyzer-master/server/cert/localhost.crt'), 	//path of the SSL Cert
	SSL_PASSPHRASE: 'fbea'															//SSL passphrase
}


//getting of emoticons
//constants for data-preprocessing