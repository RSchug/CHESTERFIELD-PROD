try {
if (publicUser && feeExists("TEMPCORES") && (balanceDue == 0)) {
		var address = aa.address.getAddressByCapId(capId).getOutput();
		var fileNames = [];
		var emailParameters; 
		emailParameters = aa.util.newHashtable();
		emailParameters.put("$$RecordID$$", capIDString); 
		sendNotification("noreply@chesterfield.gov","gentryj@chesterfield.gov;coxm@chesterfield.gov","mbouquin@truepointsolutions.com","TEMPCORES_PAYMENT",emailParameters,fileNames);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}