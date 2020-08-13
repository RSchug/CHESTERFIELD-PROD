try {
	var showMessage = true;                         
    //var showDebug = true; 
    logDebug("Starting document upload process");
	
	if (publicUser && appTypeString == 'eReview/Planning/NA/NA' && !matches(capStatus,'Submitted','Pending Applicant')) {
		//newDocModelArr = documentModelArray.toArray();
		newDocModelArr = aa.document.getDocumentListByEntity(capId,"CAP").getOutput().toArray();
		for (eachDoc in newDocModelArr) {
			eachDocItem = newDocModelArr[eachDoc];
			//check doc type
			if (matches(eachDocItem['docCategory'], 'Plans','Application', 'Calculation','Plat')) {
				cancel=true;
				comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>You cannot upload a " + eachDocItem['docCategory'] + " when the record is " + capStatus + ".</span><ol>");
			}
		}
	}
// Get Public User Email Address
	var debugEmailTo = "";
	var publicUserEmail = "";
	if (publicUserID) {
		var publicUserModelResult = aa.publicUser.getPublicUserByPUser(publicUserID);
		if (publicUserModelResult.getSuccess() || !publicUserModelResult.getOutput()) {
			publicUserEmail = publicUserModelResult.getOutput().getEmail();
			logDebug("publicUserEmail: " + publicUserEmail + " for " + publicUserID)
		} else {
			publicUserEmail = null;
			logDebug("publicUserEmail: " + publicUserEmail);
		}
	}
	if (publicUserEmail) publicUserEmail = publicUserEmail.replace("TURNED_OFF","").toLowerCase();
	logDebug("publicUserEmail: " + publicUserEmail);
	// Set Debug User if TPS User.
	if (publicUserEmail && debugEmailTo == "") {
		if (publicUserEmail.indexOf("@truepointsolutions.com") > 0) 	debugEmailTo = publicUserEmail;
		//if (exists(publicUserEmail,['rschug@truepointsolutions.com']))	debugEmailTo = publicUserEmail;
	}
	logDebug("debugEmailTo: " + debugEmailTo);
	// Send Debug Email
	if (debugEmailTo && debugEmailTo != "") {
		debugEmailSubject = "";
		debugEmailSubject += (capIDString ? capIDString + " " : (capModel && capModel.getCapID ? capModel.getCapID() + " " : "")) + vScriptName + " - Debug";
		logDebug("Sending Debug Message to "+debugEmailTo);
		aa.sendMail("NoReply-" + servProvCode + "@accela.com", debugEmailTo, "", debugEmailSubject, "Debug: " + br + debug);
	}

/*emailSendFrom = 'NoReply@accela.com';
emailSendTo = 'mgiral@pascocountyfl.net';
emailStaffCC = 'jmasone@pascocountyfl.net';
emailTemplate = 'DUA_INTERNAL NOTIFICATION_UPLOAD';
fileNames = [];
emailParameters = aa.util.newHashtable();
getRecordParams4Notification(emailParameters);
addParameter(emailParameters, '$$docName$$', eachDocItem['fileName']);

sendNotification(emailSendFrom, emailSendTo, emailStaffCC, emailTemplate, emailParameters, fileNames); */
	 
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}