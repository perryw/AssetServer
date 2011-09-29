var http = require('http'),
	less = require('less'), 
	fs = require('fs');

var SILENT 		= 0;
var NORMAL 		= 1;
var VERBOSE 	= 2;
var SILLY 		= 3;

var assetsDir 			= './';
var port 				= 8124;
var compressLessFiles 	= false;
var debugLevel 			= SILLY;

function mssg(mes, level) {
	if (level <= debugLevel) {
		console.log(mes)
	}
}

function getMimeType(ext) {
	if (ext == 'png' || ext == 'jpg' || ext == 'gif') { return "image/" + ext; }
	if (ext == 'css' || ext == 'less') { return "text/css"; }
	if (ext == 'js') { return "application/javascript"; }	
	return "text/html";
}

function getExtension(requestPath) {
	if (!requestPath) return "";
	return requestPath.substring(requestPath.lastIndexOf(".") + 1);
}

function getDirectiveValue(directiveString, searchString) {
	var retString = "";
	
	var directiveStart = searchString.indexOf(directiveString);
	
	if (directiveStart > -1) {
		directiveStart = searchString.substring(directiveStart + directiveString.length);
		var valueStart = directiveStart.indexOf('"') + 1;
		valueStart = directiveStart.substring(valueStart);
		retString = valueStart.substring(0, valueStart.indexOf('"'));
	}
	return retString	
}


function fileExists(path){
	var isFile = false;
	try {
		var stats = fs.statSync(path);
		if (stats) { isFile = stats.isFile(); }
	} catch (e) {}
	mssg("Testing file at " + path, SILLY);
	return isFile;
}

function do404(response, path) {
	mssg("WARNING: File not found at " + path, VERBOSE);
	response.writeHead(404, {'Content-Type': 'text/html'});
	response.end("File not found at" + path);
}

function do200(response, path, content) {
	mssg("Sending 200 response " + path, SILLY);
	var mimeType = getMimeType(getExtension(path));
	response.writeHead(200, {'Content-Type': mimeType});
	response.end(content);
}

/* 
	SET OPTIONS BASED ON CMD LINE ARGS
*/

for (var i=process.argv.length-1;i>1;i--) {
	switch (process.argv[i]) {
		case "--port":
		case "-p" :
			port = parseInt(process.argv[i +1]);
			break;
		case "--verbose":
		case "-v" :
			debugLevel = VERBOSE;
			break;
		case "--silent":
		case "-s" :
			debugLevel = SILENT;
			break;
		case "--compress":
		case "-c":
			compressLessFiles = true;
			break;
	}
}

mssg("Initialized at port:" + port + ", debug " + debugLevel + ", compression " + compressLessFiles, NORMAL);

http.createServer(function (request, response) {
	var requestPath = request.url.substring(1); 
	var filePath = assetsDir + requestPath;
	var requestExtension = getExtension(request.url); 
	
	function processLess (data){
					
		var parser = new(less.Parser)({ 
			paths: [assetsDir + "css/", assetsDir, '.'],
			filename: lessPath });
			
		try {
			parser.parse(data, function (err, tree) { 
				if (err){ 
					do404(response, requestPath);
					mssg("Less Parser Error : at " + lessPath + " : " + JSON.stringify(err), NORMAL);
					return;
				}	
				mssg("Processing less file at " + lessPath, VERBOSE);
				var css = tree.toCSS({ compress: compressLessFiles });
				do200(response, requestPath, css);
			});
		} catch (err) {
			do404(response, requestPath);
			mssg("Less Parser Error : at " + lessPath + " : " + err, NORMAL);
			return;
		}
		
	}

	function processJSONFiles(filesArray) {
		var counter 		= 0,
			responseArray 	= [],
			basepath 		= assetsDir + requestPath.substring(0, requestPath.lastIndexOf("/"));
		
		if (filesArray.length < 1) {
			do404(response, requestPath);	
			return;
		}
		
		function loadFile(path) {
			counter += 1;
			fs.readFile(basepath + "/" + path, "utf8", function(err, data) {
				responseArray.push(data);
				if (err != null) {
					do404(response, requestPath);	
					return;
				}
				if (counter >= filesArray.length) {
					do200(response, requestPath, responseArray.join("\n\n"));
					return;
				}
				loadFile(filesArray[counter]);
			});
		};
		loadFile(filesArray[counter]);	
	};

	if (!requestPath || requestExtension == "ico") {
		do404(response, requestPath);
		return;
	}
	
	mssg("Server intercepted a request for " + requestPath + " with extension " + requestExtension, SILLY);
	
	if (fileExists(filePath) == true) {
		fs.readFile(filePath, function(err, data) { 
			if (err){ 
				do404(response, requestPath);
				mssg("File not found : at " + filePath + " : " + err, NORMAL);
				return;
			}
			if (filePath.indexOf("-concat.js") > 0) {
				processJSONFiles(JSON.parse(data).files);
			} else {
				do200(response, requestPath, data);	
			}
		});
	} else if (requestExtension == "css" ) {
		var lessPath = filePath.substring(0, filePath.lastIndexOf(".")) + ".less";
		if (fileExists(lessPath)) {
			fs.readFile(lessPath, "utf8", function(err, data) {
				if (err){ 
					do404(response, requestPath);
					mssg("File not found : at " + lessPath + " : " + err, NORMAL);
					return;
				}
				processLess(data);
			});
		} else {
			mssg("WARNING requesting a nonexistent LESS file", NORMAL);
			do404(response, requestPath);
		}
	} else {
		mssg("WARNING requesting a nonexistent file at " + filePath, NORMAL);
		do404(response, requestPath);
	}
	
}).listen(port);

mssg('Server running at http://localhost:' + port + '/', NORMAL);