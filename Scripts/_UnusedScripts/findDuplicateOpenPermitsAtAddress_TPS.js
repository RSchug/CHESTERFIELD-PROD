//Function to look for open records at the same address
function findDuplicateOpenPermitsAtAddress_TPS(pCapArray, pPermitType) {
	try {
		var openPermitList = [];
		for (var i in pCapArray) {
			var splitArray = String(pCapArray[i]).split('-');
			var capId = aa.cap.getCapID(splitArray[0], splitArray[1], splitArray[2]).getOutput();
			var relcap = aa.cap.getCap(capId).getOutput();
			var dDateObj = relcap.getFileDate();
			var reltype = relcap.getCapType().toString();
			if (pPermitType == reltype) {
				relStatus = aa.cap.getStatusHistoryByCap(relcap.getCapID(), "APPLICATION", null);
				var statusHistoryList = relStatus.getOutput();
				if (statusHistoryList.length > -1) {
					var statusHistory = statusHistoryList[0];
					if (statusHistory.getStatus().indexOf("Close") == -1 && statusHistory.getStatus().indexOf("Withdrawn") == -1 && statusHistory.getStatus().indexOf("Cancelled") == -1) {
						openPermitList.push(statusHistory);
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