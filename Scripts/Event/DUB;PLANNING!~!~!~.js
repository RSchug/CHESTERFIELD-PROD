try {
	var docTypeArrayModule = ["Plans","Application","Calculation","Code Modification","Plat"];
	showDebug = false;
	/*------------LOAD DOCUMENT ARRAY------------*/
	var newDocModelArray = documentModelArray.toArray();
	for (dl in newDocModelArray) {
		logDebug("<font color='green'>*****Document Details*****</font>");
		logDebug("<font color='green'>DocName: " + newDocModelArray[dl]["docName"] + " - DocID: " + newDocModelArray[dl]["documentNo"] + "</font>");
		logDebug("<font color='green'>DocGroup / DocCategory: " + newDocModelArray[dl]["docGroup"] + " / " + newDocModelArray[dl]["docCategory"] + "</font>");
		logDebug("<font color='green'>DocStatus: " + newDocModelArray[dl]["docStatus"] + "</font>");
		logDebug("<font color='green'>DocCategoryByAction: " + newDocModelArray[dl]["categoryByAction"] + "</font>");
		logDebug("<font color='green'>FileUploadBy: " + newDocModelArray[dl]["fileUpLoadBy"] + "</font>");
	}
	
	//From eReview
	if (publicUser && appMatch("Planning/*/*/*") && !matches(capStatus,'Submitted','Pending Applicant','Revisions Received',null)) {
		cancel = true;
		showMessage = true;
		comment("<B><font color='red'>Error: You cannot upload a document when the record is " + capStatus + ".</B></font>");
    }
	/*if (publicUser && appTypeString == 'eReview/Building/NA/NA' && !matches(capStatus,'Submitted','Pending Applicant') && exists(newDocModelArray[dl]["docCategory"],docTypeArrayModule)) {
		cancel = true;
		showMessage = true;
		comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>Error: You cannot upload a " + newDocModelArray[dl]["docCategory"] + " when the record is " + capStatus + ".</span><ol>");
    }*/
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}