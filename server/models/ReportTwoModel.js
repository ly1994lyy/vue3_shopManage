module.exports = function(db,callback){
	// 报表模型1
	db.define("ReportTwoModel",{
		id : {type: 'serial', key: true},
		rp2_page : String,
		rp2_count : Number,
		rp2_date : { type: "date", time: false }
	},{
		table : "sp_report_2"
	});
	return callback();
}