function generateCommunityCode(ComCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 35; i < 1000; i++) {
        var ASIValue1 = i;
		if (ASIValue1 < 100) {
			ASIValue1 = '0' + ASIValue1;
		} else if (AInfo[ComCodeName] < 1000) {
			ASIValue1 = ASIValue1;
		}
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(ComCodeName, ASIValue1);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + ComCodeName + ": " + ASIValue1 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue1 = null;
            break; // Active record found so get next number
        }
        if (ASIValue1 != null) break
    }
    return ASIValue1;
}