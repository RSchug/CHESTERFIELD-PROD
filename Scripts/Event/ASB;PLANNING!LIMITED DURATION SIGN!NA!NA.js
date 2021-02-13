try {
//07-2020 Boucher 15p - This is also in Pageflow for LDS record
	var duplicatePermits = 0;
	if (!publicUser) {  //add publicUer here because of pageflow script
		duplicatePermits = findDuplicateOpenPermitsAtAddress(capIdsGetByParcel(ParcelValidatedNumber), appTypeString);
		if (duplicatePermits > 0) {
			showMessage = true;
			comment('<B><Font Color=RED>Error: There are ' + duplicatePermits + ' permit(s) for ' + appTypeString + ' that have been opened within the last 6 months.</B></Font>');
		}
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}