/**
 * Get a License Professional by Business Name
 * 
 * @param {any} businessName 
 * @returns {array}
 */
function getLPByBusinessName(businessName) {
	var result = aa.licenseScript.getTradeNameList(businessName, null);

	if (result.getSuccess()) {
		var licenses = result.getOutput().toArray();
		for (l in licenses) {
			thisLicense = licenses[l];
			var stateLicense = thisLicense["stateLicense"];
			logDebug("License Professional found. " + stateLicense);
		}
		return licenses;
	} else {
		logDebug("License Professional not found." + businessName);
		return null;
	}
}
