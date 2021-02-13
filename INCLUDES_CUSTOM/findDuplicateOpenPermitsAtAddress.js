//Function to look for open duplicate permits that are less than 6 months old at the same address.
function findDuplicateOpenPermitsAtAddress(pCapArray, pPermitType) {
	try {
		var openPermitList = [];
		for (var i in pCapArray) {
			var splitArray = String(pCapArray[i]).split('-');
			var capId = aa.cap.getCapID(splitArray[0], splitArray[1], splitArray[2]).getOutput();
			var relcap = aa.cap.getCap(capId).getOutput();
			var dDateObj = relcap.getFileDate();
			var reltype = relcap.getCapType().toString();
			if (pPermitType == reltype) {
				var today = new Date();
				var permitDate = new Date(String(dDateObj.getYear()), String(dDateObj.getMonth()) - 1, String(dDateObj.getDayOfMonth()));
				var dateDiff = (today - permitDate) / (1000 * 60 * 60 * 24);
				if (dateDiff < 183) { //6 months
					//if(dateDiff < 1) {  //1 day test
					relStatus = aa.cap.getStatusHistoryByCap(relcap.getCapID(), "APPLICATION", null);
					var statusHistoryList = relStatus.getOutput();
					if (statusHistoryList.length > -1) {
						var statusHistory = statusHistoryList[0];
						if (statusHistory.getStatus().indexOf("Close") == -1 && statusHistory.getStatus().indexOf("Withdrawn") == -1 && statusHistory.getStatus().indexOf("Abandon") == -1 && statusHistory.getStatus().indexOf("Cancelled") == -1) {
							openPermitList.push(statusHistory);
							//if (openPermitList.length > 0) {  //This code in in the ASA:
								//return ("WARNING: There is a permit for " + pPermitType + " that has been opened within the last 6 months.");
								//return (openPermitList.length); }
						}
					}
				}
			}
		}
		return openPermitList.length;
	} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
		return -1;
	}
}