var request = require('request'),
	cheerio = require('cheerio');

module.exports = function(options, callback){
	exports.getInfo(options, function(err,results){
		callback(err,results);
	});
};

/*
 * get info
 * @param string url - user input of url
 * @param function callback
 */
exports.getInfo = function(options, callback){
	var error = null, returnResule = {};
	that = this;
	this.validateVars(options.url, options.timeout, function(inputUrlFlag, inputUrl, inputTimeoutFlag, inputTimeout){
		if(inputUrlFlag && inputUrlFlag == true && inputTimeoutFlag && inputTimeoutFlag == true){
			options.url = inputUrl;
			options.timeout = inputTimeout;
			that.getOG(options, function(err, results) {
				if(results && results.success){
					returnResule = {
						data: results,
						success: true
					};
				}else{
					if(err && (err.code == 'ENOTFOUND' || err.code == 'EHOSTUNREACH')){
						error = 'err';
						returnResule = {
							err: 'Page Not Found',
							success: false
						};
					} else if(err && err.code == 'ETIMEDOUT'){
						error = 'err';
						returnResule = {
							err: 'Time Out',
							success: false
						};
					}else{
						error = 'err';
						returnResule = {
							err: 'Page Not Found',
							success: false
						};
					}
				};
				callback(error,returnResule);
			});
		}else{
			callback('err',{
				success: false,
				err: 'Invalid URL'
			});
		};
	});
};

/*
 * validate var
 * @param string var - user input
 * @param function callback
 */
exports.validateVars = function(inputUrl, inputTimeout, callback) {
	var returnInputUrl,returnInputUrlFlag,returnInputTimeout,returnInputTimeoutFlag;
	if ( inputUrl == null || inputUrl.length < 1 || typeof inputUrl === 'undefined' || !inputUrl) {
		returnInputUrlFlag = false;
		returnInputUrl = '';
	} else {
		returnInputUrlFlag = true;
		returnInputUrl = this.validateUrl(inputUrl)
	};
	if ( inputTimeout == null || inputTimeout.length < 1 || typeof inputTimeout === 'undefined' || !inputTimeout) {
		returnInputTimeoutFlag = true;
		returnInputTimeout = 2000; //time default to 2000ms
	} else {
		if(this.validateTimeout(inputTimeout)){
			returnInputTimeoutFlag = true;
			returnInputTimeout = inputTimeout;
		} else {
			returnInputTimeoutFlag = true;
			returnInputTimeout = 2000; //time default to 2000ms
		}
	};
	callback(returnInputUrlFlag, returnInputUrl, returnInputTimeoutFlag, returnInputTimeout)
};

/*
 * validate url - all urls must have http:// in front of them
 * @param string var - the url we want to scrape
 * @param function callback
 */
exports.validateUrl = function(inputUrl) {
	if(!/^(f|ht)tps?:\/\//i.test(inputUrl)) {
		inputUrl = "http://" + inputUrl;
	};
	return inputUrl;
};

/*
 * validate timeout - how long should we wait for a request
 * @param number var - the time we want to wait
 * @param function callback
 */
exports.validateTimeout = function(inputTimeout) {
	if(!/^\d{1,10}$/.test(inputTimeout)) {
		return false;
	};
	return true;
};

/*
 * getOG - scrape that url!
 * @param string url - the url we want to scrape
 * @param function callback
 */
exports.getOG = function(options, callback) {
	request(options, function(err, response, body) {
		if(err){
			callback(err, null);
		} else {
			var $ = cheerio.load(body),
				meta = $('meta'),
				keys = Object.keys(meta),
				ogObject = {};

			//able to get og info
			ogObject.success = 'true';

			keys.forEach(function (key) {
				if (!meta[key].attribs) return;
				var attrs = meta[key].attribs;

				if (attrs.property) {
					if (attrs.property === 'og:title') {
						ogObject.ogTitle = meta[key].attribs.content;
					};

					if (attrs.property === 'og:type') {
						ogObject.ogType = meta[key].attribs.content;
					};

					if (attrs.property === 'og:image') {
						ogObject.ogImage = meta[key].attribs.content;
					};

					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:url'){
						ogObject.ogUrl = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:audio'){
						ogObject.ogAudio = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:description'){
						ogObject.ogDescription = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:determiner'){
						ogObject.ogDeterminer = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:locale'){
						ogObject.ogLocale = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:locale:alternate'){
						ogObject.ogLocaleAlternate = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:site_name'){
						ogObject.ogSiteName = meta[key].attribs.content;
					};
					if(meta[key].attribs && meta[key].attribs.property && meta[key].attribs.property === 'og:video'){
						ogObject.ogVideo = meta[key].attribs.content;
					};
				}

				if (!ogObject.ogDescription && attrs.name == 'description') {
					ogObject.ogDescription = attrs.content;
				}
			});

			// Get title tag if og:title not provided
			if (!ogObject.ogTitle) {
				ogObject.ogTitle = $('title').text();
			}

			callback(null, ogObject);
		};
	});
};