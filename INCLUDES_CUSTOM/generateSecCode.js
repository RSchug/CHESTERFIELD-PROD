function generateSecCode(SecCodeName) {
    var inActiveCapStatuses = ["Cancelled", "Closed", "Expired", "Withdrawn"];

    for (var i = 10; i < 10000; i++) {
        var ASIValue4 = '00'+i;
        logDebug("Checking " + SecCodeName + " sequence: " + ASIValue4);
        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(SecCodeName, ASIValue4);
        if (!getCapResult.getSuccess()) { logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage()); return null }
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray) {
            var myCapId = apsArray[aps].getCapID();
            var myCap = aa.cap.getCap(myCapId).getOutput();
            var myCapStatus = myCap.getCapStatus();
            if (inActiveCapStatuses && exists(myCapStatus, inActiveCapStatuses)) continue; // skip inactive record.
            logDebug("Found " + SecCodeName + ": " + ASIValue4 + " " + myCap.getCapID().getCustomID() + " " + myCapStatus);
            ASIValue4 = null;
            break; // Active record found so get next number
        }
        if (ASIValue4 != null) break
    }
    return i;
}