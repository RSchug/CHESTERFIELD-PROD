try {
// set the Permit Expiration Date to 180 days from Application Date.
	logDebug("fileDate: " + new Date(fileDate));
	var expField = "Permit Expiration Date";
	var expDateNew = jsDateToASIDate(new Date(dateAdd(fileDate,180)));
	logDebug("Updating " + expField + " to " + expDateNew);
	editAppSpecific(expField, expDateNew);

//update ASI Housing Units based on Additional Info Housing Units
	if (!publicUser) {
		editAppSpecific("Number of Units", houseCount);
	}

//If Is a contractor to be determined? is "Yes" then add Licensed Professional Type of "Contractor" and License # of "TBD"//
	if (AInfo["Is a contractor to be determined?"] == "Yes") {
		var lpType = "Contractor", lpId = "TBD", lpBoard = null, lpExpirDate = null, lpFirstName = "", lpLastName = "To Be Determined";
		createLP(lpId, lpType, capId, lpBoard, lpExpirDate, lpFirstName, null, lpLastName);
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}