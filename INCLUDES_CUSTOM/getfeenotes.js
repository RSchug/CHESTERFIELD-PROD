function getfeenotes(capid,feecode,startdate,endate) {
	var jsEndDate = new Date(endate);
    var jsStartDate = new Date(startdate);
	var notes = '';
	var test = aa.fee.getFeeItems(capid).getOutput();
	for (x in test){
		var appdate1 = String(test[x].getF4FeeItemModel().getApplyDate());
		var appdate2 = appdate1.slice(0,10);
		var appdate3 = appdate2.split("-");
		var appdate = new Date(appdate3[1] + "/" + appdate3[2] + "/" + appdate3[0]);
		if(test[x].getFeeCod() == feecode && (appdate >= jsStartDate && jsEndDate >= appdate)) {
			notes = test[x].getF4FeeItemModel().getFeeNotes();
		}
	}
	return notes
}
