function generateDevCode(DevCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 4480; i < 100000; i++) {
        var ASIValue3 = i;
		if (ASIValue3 < 10000) {
			ASIValue3 = '0' + ASIValue3;
		} else if (ASIValue3 < 100000) {
			ASIValue3 = ASIValue3;
		}
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(DevCodeName, ASIValue3);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + DevCodeName + ": " + ASIValue3 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue3 = null;
            break; // Active record found so get next number
        }
        if (ASIValue3 != null) break
    }
    return ASIValue3;
}