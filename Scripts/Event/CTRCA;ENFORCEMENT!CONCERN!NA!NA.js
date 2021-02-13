try {
	if (AInfo['Thoroughfare Plan/Ultimate Right-of-Way'] == 'CHECKED' || AInfo['Through-Truck Traffic Restriction Request'] == 'CHECKED' || AInfo['Road Project Request/Suggestion'] == 'CHECKED' || AInfo['Traffic Calming'] =='CHECKED' || AInfo['Bikeway/Pedestrian Accommodation Request'] =='CHECKED'){
		var address = aa.address.getAddressByCapId(capId).getOutput();
		var fileNames = [];
		var emailParameters; 
		emailParameters = aa.util.newHashtable();
		emailParameters.put("$$RecordID$$", capIDString); 
		sendNotification("noreply@chesterfield.gov","mbouquin@truepointsolutions.com","jguest@truepointsolutions.com","CONCERN_TRANSPORTATION",emailParameters,fileNames);
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}