if ((wfTask == "Inspections" && wfStatus == "Completed") && AInfo["Permanent installation?"] == "Yes"){ 
	// Update Permit Expiration Date
	var expField = "Permit Expiration Date";
	var expDateNew = jsDateToASIDate(new Date(dateAdd(null,275)));
	logDebug("Updating " + expField + " to " + expDateNew);
	editAppSpecific(expField, expDateNew);
}