try {
	if (wfStatus == 'Amendment Submitted') {
		var totalChildOpen = 0;
		var msgDetails = [];
		if (appMatch("Building/Permit/Commercial/NA"))
			var childAppTypeString = "Building/Permit/Commercial/Amendment";
		else if (appMatch("Building/Permit/Commercial/*"))
			var childAppTypeString = "Building/Permit/Commercial/AmendmentTrade";
		var childCapStatuses = ["Revision Complete"];
		if (childAppTypeString) {
			childCapIds = getChildren(childAppTypeString, capId);
			if (childCapIds && typeof (childCapIds) == "object") {
				for (var eachChild in childCapIds) {
					var childCapId = childCapIds[eachChild];
					var cCapObj = aa.cap.getCap(childCapId);
					var childCap = cCapObj.getOutput();
					childCapStatus = childCap.getCapStatus();
					logDebug("The Child Status is: " + childCapStatus);
					if (childCapStatuses && !exists(childCapStatus, childCapStatuses)) continue;
					msgDetails.push(childCapId.getCustomID() + " is " + childCapStatus)
					totalChildOpen = totalChildOpen + 1;
				}
			}
		}
		if (totalChildOpen > 0) {
			showMessage = true;
			comment("<font size=small><b>Open Amendment:</b></font><br><br>This record has " + totalChildOpen + " " + msgDetails.length + " open Amendment(s): " + msgDetails.join(",") + "<br>");
			cancel = true
		}
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}