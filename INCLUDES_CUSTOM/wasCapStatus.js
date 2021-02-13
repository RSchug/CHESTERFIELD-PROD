function wasCapStatus() {
	var capStatusArray = arguments.length > 0 && arguments[0]? arguments[0]:capId;
	var itemCap = arguments.length > 1 && arguments[1]? arguments[1]:capId;

	var lastCapStatus = null;
	var capStatuses = [];
	
	var capStatusResult = aa.cap.getStatusHistoryByCap(itemCap, "APPLICATION", null);
	if(!capStatusResult.getSuccess()) { 
		logDebug("ERROR: Failed to get cap status history for CAPID(" + itemCap + "). " + getCapStatus.getErrorMessage());
		return false;
	}

	var capStatuses= capStatusResult.getOutput();
	for (i in capStatuses) {
		var capStatus = capStatuses[i].getStatus();
		var capStatusDate = capStatuses[i].getStatusDate();
		logDebug("Checking " + capStatus + " " + convertDate(capStatusDate) + (capStatusArray? " for " + capStatusArray.join(","):""));
		if (capStatusArray && !exists(capStatus, capStatusArray)) continue;
		logDebug("Found " + capStatus + " " + convertDate(capStatusDate));
		return true;
	}
	
	return false;
}
