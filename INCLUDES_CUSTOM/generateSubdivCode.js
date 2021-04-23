function generateSubdivCode(SubCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 930; i < 100000; i++) {
        var ASIValue2 = i;
		if (ASIValue2 < 1000) {
			ASIValue2 = '00' + ASIValue2;
		} else if (ASIValue2 < 10000) {
			ASIValue2 = '0' + ASIValue2;
		} else if (ASIValue2 < 100000) {
			ASIValue2 = ASIValue2;
		}
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(SubCodeName, ASIValue2);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + SubCodeName + ": " + ASIValue2 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue2 = null;
            break; // Active record found so get next number
        }
        if (ASIValue2 != null) break
    }
    return ASIValue2;
}