var _ = require('lodash');
var path = require("path");
var dao = require(path.join(process.cwd(),"dao/DAO"));

function reportOne(cb) {
	dao.list("ReportOneModel",null,function(err,result){
		if(err) return cb("获取报表数据失败");
		var areaKeyResult = {};
		var areaKeys = _.union(_.map(result,"rp1_area"));
		var dateKeys = _.union(_.map(result,function(record){
			str = record["rp1_date"].getFullYear() + "-" + (record["rp1_date"].getMonth() + 1) + "-" + record["rp1_date"].getDate()
			console.log(str);
			return str;
		}));
		for(var idx in result) {
			var record = result[idx];
			var dateKey = record["rp1_date"].getFullYear() + "-" + (record["rp1_date"].getMonth() + 1) + "-" + record["rp1_date"].getDate();
			if(!areaKeyResult[record["rp1_area"]]) {
				areaKeyResult[record["rp1_area"]] = {};
			}
			areaKeyResult[record["rp1_area"]][dateKey] = record;
		}
		// 格式输出
		var series = [];
		_(areaKeys).forEach(function(areaKey){
			var data = []

			_(dateKeys).forEach(function(dateKey){
				console.log("areaKey:" + areaKey + "," + "dateKey:" + dateKey);
				if(areaKeyResult[areaKey][dateKey]) {
					data.push(areaKeyResult[areaKey][dateKey]["rp1_user_count"]);
				} else {
					data.push(0);
				}
			})
			series.push({
				name:areaKey,
				type:'line',
            	stack: '总量',
            	areaStyle: {normal: {}},
				data:data
			})
		});
		data = {
		    legend: {
		        data : areaKeys
		    },
		    yAxis : [
		        {
		            type : 'value'
		        }
		    ],
		    xAxis : [
		        {
		            data :dateKeys
		        }
		    ],
		    series : series
		};
		

		cb(null,data);
	});
}

function reportTwo(cb) {
	dao.list("ReportTwoModel",null,function(err,result){
		if(err) return cb("获取报表数据失败");
		var dateKeyResult = {};
		for(var idx in result) {
			var record = result[idx];
			var dateKey = record["rp2_date"].getFullYear() + "-" + (record["rp2_date"].getMonth() + 1) + "-" + record["rp2_date"].getDate();
			if(!dateKeyResult[dateKey]) {
				dateKeyResult[dateKey] = [];
			}
			dateKeyResult[dateKey].push(record);
		}
		cb(null,dateKeyResult);
	});
}

function reportThree(cb) {

}

function reportFour(cb) {

}

module.exports.reports = function(typeid,cb) {
	console.log(typeid);
	switch (parseInt(typeid)) {
		case 1:
			reportOne(function(err,result){
				if(err) return cb(err);
				cb(null,result);
			});
			break;
		case 2:
			reportTwo(function(err,result){
				if(err) return cb(err);
				cb(null,result);
			});
			break;
		case 3:
			reportThree(function(err,result){
				if(err) return cb(err);
				cb(null,result);
			});
			break;
		case 4:
			reportFour(function(err,result){
				if(err) return cb(err);
				cb(null,result);
			});
			break;
		default:
			cb("类型出错");
			break;
	}
}