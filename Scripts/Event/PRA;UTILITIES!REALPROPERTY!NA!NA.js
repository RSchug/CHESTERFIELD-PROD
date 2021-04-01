try {
	if (publicUser) {
		var address = aa.address.getAddressByCapId(capId).getOutput();
		var fileNames = [];
		var emailParameters; 
		emailParameters = aa.util.newHashtable();
		emailParameters.put("$$RecordID$$", capIDString); 
		emailParameters.put("$$ProjectName$$", capName);
		sendNotification("noreply@chesterfield.gov","realpropertyoffice@chesterfield.gov","mbouquin@truepointsolutions.com","REALPROPERTY_PAYMENT",emailParameters,fileNames);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}