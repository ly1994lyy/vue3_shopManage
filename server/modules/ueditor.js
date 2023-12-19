var _ = require('lodash');
var path = require("path");
var Busboy = require('busboy');
var fs = require("fs");
var uniqid = require('uniqid');
var ueditor_config = require(path.join(process.cwd(),"/config/ueditor.config.js"));
var upload_config = require('config').get("upload_config");

var filetype = 'jpg,png,gif,ico,bmp';
module.exports = function(req,res,next) {

	if(req.query.action == "config") {
		// 吐给客户端配置信息 
		res.jsonp(ueditor_config);
	} else if (req.query.action === 'uploadimage' || req.query.action === 'uploadfile' || req.query.action === 'uploadvideo') {
		var busboy = new Busboy({ headers: req.headers });
		busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
			var fileExtArray = filename.split(".");
			var ext = fileExtArray[fileExtArray.length - 1];
			var save_filename = uniqid() + "." + ext;
			var savePath = path.join(process.cwd(),upload_config.get("upload_ueditor"),save_filename);
			file.on('end', function () {
				var result = {
				'url': upload_config.get("baseURL")+"/" + upload_config.get("upload_ueditor") + "/" + save_filename,
				'title': req.body && req.body.pictitle || filename,
				'original': filename,
				'state': 'SUCCESS'
				};
				if(req.query.encode) {
					res.jsonp(result);
				} else {

					res.redirect(upload_config.get("simple_upload_redirect") + "?result=" + JSON.stringify(result));
					// res.redirect(result.url);
				}
				
			});

			file.pipe(fs.createWriteStream(savePath));
		});
		req.pipe(busboy);
	} else if(req.query.action === 'listimage') {
		fs.readdir(path.join(process.cwd(),upload_config.get("upload_ueditor")),function(err, files){
			if(err) return res.end();
			var total = files.length;

			var filelist = [];
			var total = 0;
			_(files).forEach(function(file){
				var fileExtArray = file.split(".");
				var ext = fileExtArray[fileExtArray.length - 1];
				if (filetype.indexOf(ext.toLowerCase()) >= 0) {
					var result_file = {};
					result_file.url = upload_config.get("baseURL")+"/" + upload_config.get("upload_ueditor") + "/" + file;
					filelist.push(result_file);
					total ++;
				}
			});
			res.jsonp({
				"state": "SUCCESS",
				"list": filelist,
				"start": 1,
				"total": total
              });
		})
	}
}