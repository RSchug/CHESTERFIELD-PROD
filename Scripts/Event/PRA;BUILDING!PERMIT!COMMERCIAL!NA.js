try {
if (publicUser && feeExists("TEMPCO") && (balanceDue == 0)) {
		var address = aa.address.getAddressByCapId(capId).getOutput();
		var fileNames = [];
		var emailParameters; 
		emailParameters = aa.util.newHashtable();
		emailParameters.put("$$RecordID$$", capIDString); 
		sendNotification("noreply@chesterfield.gov","fitzker@chesterfield.gov","mbouquin@truepointsolutions.com","TEMPCO_PAYMENT",emailParameters,fileNames);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}