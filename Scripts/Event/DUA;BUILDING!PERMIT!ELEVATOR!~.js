try {
//add by Keith 9-29-19 to for proof of concept.
//if (isTaskActive("Inspection"))
//   {
//   closeTask("Inspection","Inspection Report Uploaded","Report Uploaded","");	saveId = capId;
//   }
	if (publicUser) {
		var address = aa.address.getAddressByCapId(capId).getOutput();
		var fileNames = [];
		var emailParameters; 
		emailParameters = aa.util.newHashtable();
		emailParameters.put("$$RecordID$$", capIDString); 
emailParameters.put("$$ProjectName$$", capName);
		sendNotification("noreply@chesterfield.gov","whitee@chesterfield.gov;watsona@chesterfield.gov","mbouquin@truepointsolutions.com","ELEVATOR_DOCUMENT",emailParameters,fileNames);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}