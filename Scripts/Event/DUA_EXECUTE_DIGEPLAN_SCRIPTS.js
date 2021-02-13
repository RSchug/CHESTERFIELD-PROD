try {   //DUA_EXECUTE_DIGEPLAN_SCRIPTS
	logDebug("Inside DUA_EXECUTE_DIGEPLAN_SCRIPTS");
	/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
	//Document Specific Variables
	var docGroupArrayModule = ["GENERAL","CC-PLN-ZC","CC-PLN-VP","CC-PLN-HP","CC-PLN-SS","CC-PLN-PP","CC-EE-GENERAL","CC-EE-BMP","CC-EE-PR","CC-EE-LD","CC-UTL-GENERAL"];
	var docTypeArrayModule = ["Plans","Supporting Documents","Plat","Survey Plat","Elevations or Renderings","Site Plan/Master Plan","Concept/Master Plan","Access Plan","Improvement Plan","Final Plans","Site Plan / Key Plan"];
	var originalDocStatusOnResubmit = "Resubmitted";
	var parentDocStatusOnResubmit = "Resubmitted";
	var resubmitDocStatusOnResubmit = "Uploaded";

	//Workflow Specific variables
	if (appMatch('EnvEngineering/*/*/*')) { var routingTask = "Review Consolidation"; 
	} else { var routingTask = "Review Distribution"; }
	var routingStatus = "Routed for Review";
	var routingResubmittalStatus = "Revisions Received";

	/*------------START EDR UPLOAD/RESUBMITTAL ACTIONS------------*/
	/*
	//Update any document uploaded by DigEplan to comments
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			if(docArray[d]["fileUpLoadBy"] == digEplanAPIUser) {
				docArray[d].setDocStatus(docCommentCategory);
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}
		}
	}
	*/
	//Any new document uploaded via RESUBMIT, will be updated and status for intake
	var newDocModelArray = documentModelArray.toArray();
	var doPreCache = false;
	//db updated per business request 4-27-2020
	//if(publicUser && capIDString.indexOf("TMP") == -1) emailDocUploadNotification(docGroupArrayModule,docTypeArrayModule);
	//if (capIDString.indexOf("TMP") == -1) {
	for (dl in newDocModelArray) {
		if(exists(newDocModelArray[dl]["docGroup"],docGroupArrayModule) && exists(newDocModelArray[dl]["docCategory"],docTypeArrayModule)) {
			logDebug("<font color='green'>*****Document Details*****</font>");
			logDebug("<font color='green'>DocName: " + newDocModelArray[dl]["docName"] + " - DocID: " + newDocModelArray[dl]["documentNo"] + "</font>");
			logDebug("<font color='green'>DocGroup / DocCategory: " + newDocModelArray[dl]["docGroup"] + " / " + newDocModelArray[dl]["docCategory"] + "</font>");
			logDebug("<font color='green'>DocStatus: " + newDocModelArray[dl]["docStatus"] + "</font>");
			logDebug("<font color='green'>DocCategoryByAction: " + newDocModelArray[dl]["categoryByAction"] + "</font>");
			logDebug("<font color='green'>FileUploadBy: " + newDocModelArray[dl]["fileUpLoadBy"] + "</font>");
	  
			if(newDocModelArray[dl]["categoryByAction"] == "RESUBMIT") {
				doResubmitActions(newDocModelArray[dl],docGroupArrayModule,docTypeArrayModule,routingTask,routingResubmittalStatus,originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit);
				updateAppStatus("Revisions Received", "Update from a Resubmit");
				doPreCache = true;
			}
		}
	}
	if(doPreCache) {
		 var docPreCache = digEplanPreCache("chesterfield",capIDString);
	}
	/*------------END EDR UPLOAD/RESUBMITTAL ACTIONS------------*/
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}