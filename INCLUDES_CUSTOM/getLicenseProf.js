function getLicenseProf() {
	var licProfTypes = (arguments.length > 0 && arguments[0]? arguments[0]:null);
	var licProfIds = (arguments.length > 1 && arguments[1]? arguments[1]:null);
	var itemCap = (arguments.length > 2 && arguments[2]? arguments[2]:capId);

	var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
	if (!capLicenseResult.getSuccess())
	{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }
	var capLicenseArr = capLicenseResult.getOutput();
	if (!capLicenseArr)
	{ logDebug("WARNING: no license professional available on the application:"); return false; }
	
	var capLicArr = [];
	for (capLic in capLicenseArr) {
		var lpsm = capLicenseArr[capLic];
		if (licProfTypes && !exists(lpsm.getLicenseType() + "",licProfTypes)) continue;
		if (licProfIds &&  !exists(lpsm.getLicenseNbr() + "",licProfIds)) continue;
		logDebug("Found License Professional with Type: " + lpsm.getLicenseType() + ", Nbr: " + lpsm.getLicenseNbr()
		+ (lpsm.getContactFirstName() || lpsm.getContactLastName()? ", Name:" + (lpsm.getContactFirstName()? " " + lpsm.getContactFirstName():"") + (lpsm.getContactLastName()? " " + lpsm.getContactLastName():""):"")
		+ (lpsm.getBusinessName()? ", BusName: " + lpsm.getBusinessName():""));
		capLicArr.push(lpsm); //Found Licensed Prof of specified type and/or #
	}

	if (capLicArr.length > 0) return capLicArr;
	return false;
}
