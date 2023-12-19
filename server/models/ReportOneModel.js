module.exports = function(db,callback){
	// 报表模型1
	db.define("ReportOneModel",{
		id : {type: 'serial', key: true},
		rp1_user_count : Number,
		rp1_area : Number,
		rp1_date : { type: "date", time: false }
	},{
		table : "sp_report_1"
	});
	return callback();
}