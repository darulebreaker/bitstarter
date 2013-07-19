#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var rest=require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT="http://shrouded-refuge-3464.herokuapp.com/";

var assertUrlExists=function(url){
//console.log("in assertUrl");
    rest.get(url,"buffer").on('complete',function(result){
	if(result instanceof Error){
	console.log("Error: "+result.message);
//this.retry(5000);// try again after 5 secs
}
else {
//console.log("assertUrl: %s",result);
    var r=new Buffer( result);
var checkJson=    checkHtmlFile(r,CHECKSFILE_DEFAULT);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);

}
});
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
//    return cheerio.load(fs.readFileSync(htmlfile));
//console.log("cheerioHtmlFile: %s",htmlfile);
  //console.log(cheerio.load(htmlfile));
  return cheerio.load(htmlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};
var checkHtmlFile = function(htmlfile, checksfile) {
//console.log("checkHtmlFile: %s",htmlfile);
    $ = cheerioHtmlFile(htmlfile);

    var checks = loadChecks(checksfile).sort();
//console.log($);

  var out = {};
    for(var ii in checks) {
//console.log("%s:%s",ii,checks[ii]);
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {

    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
//        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_path>', 'Path to url', clone(assertUrlExists), URL_DEFAULT)
	.parse(process.argv);
//console.log("url %s ",program.url);
var t=assertUrlExists(program.url);
//console.log(t);
//var s=new Buffer(1000);
//s.write(t);
//console.log(s);
    var checkJson = checkHtmlFile(program.url, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
//    console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
