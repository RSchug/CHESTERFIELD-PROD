/*--------START DIGEPLAN EDR CUSTOM FUNCTIONS---------*/
function getAssignedToStaff() // option CapId
{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ 	logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
			return false;
		}
	
	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ 	logDebug("**ERROR: No cap detail script object") ;
			return false;
		}
		
	cd = cdScriptObj.getCapDetailModel();
	
	//cd.setCompleteDept(iName.getDeptOfUser());
	var returnValue = cd.getAsgnStaff();
	//cdScriptObj.setCompleteDate(sysDate);
	
	//logDebug("Returning Assigned To Staff value: " + returnValue);
	
	return returnValue; 
}

function edrPlansExist(docGroupArray,docCategoryArray) {
	var edrPlans = false;
	
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) if(exists(docArray[d]["docGroup"],docGroupArray) && exists(docArray[d]["docCategory"],docCategoryArray)) edrPlans = true;
	}
	
	return edrPlans;
}

function emailReviewCompleteNotification(ResubmitStatus, ApprovedStatus, docGroupArrayModule) {
    showMessageDefault = showMessage;
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    getAPOParams4Notification(emailParameters);
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    //getACARecordParam4Notification(emailParameters,acaSite);
    addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
    addParameter(emailParameters, "$$wfComment$$", wfComment);
    addParameter(emailParameters, "$$wfStatus$$", wfStatus);
    addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

    var applicantEmail = "";
    var assignedTo = getAssignedToStaff();
    var assignedToEmail = "";
    var assignedToFullName = "";
    var contObj = {};
    contObj = getContactArray(capId);
    if (typeof(contObj) == "object") {
        for (co in contObj) {
            if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
        }
    }

    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);

    if (assignedTo != null) {
        assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
        if (!matches(aa.person.getUser(assignedTo).getOutput().getEmail(), undefined, "", null)) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
        }
    }
    addParameter(emailParameters, "$$assignedToFullName$$", assignedToFullName);
    addParameter(emailParameters, "$$assignedToEmail$$", assignedToEmail);

    if (applicantEmail != "") {
        if (exists(wfStatus, ResubmitStatus)) {
			//if (appMatch("eReview/*/*/*"))
			var emailTemplate = "WTUA_CONTACT NOTIFICATION_RESUBMIT";

            var fileNameArray = [];
            var fileNameString = "";
            docArray = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
            if (docArray != null && docArray.length > 0) {
                for (d in docArray) {
                    601
                    if (docArray[d]["fileUpLoadBy"] == digEplanAPIUser && docArray[d]["allowActions"] != null && docArray[d]["allowActions"].indexOf("RESUBMIT") >= 0) { // docArray[d]["docStatus"] == reviewCompleteDocStatus
                        //fileNameArray.push(docArray[d]["fileName"]);
                        getResubmitFileName(docArray[d], fileNameArray);
                    }
                }
            }
            if (fileNameArray.length > 0)
                fileNameString = "Document(s) requiring correction: " + fileNameArray;
				addParameter(emailParameters, "$$correctionFileNames$$", fileNameString);
        }
        if (exists(wfStatus, ApprovedStatus)) {
			//if (appMatch("eReview/*/*/*"))
			var emailTemplate = "WTUA_CONTACT NOTIFICATION_APPROVED";
        }
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    } else {
        if (applicantEmail == "" && assignedToEmail != "") {
            var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCOMPLETE";
            sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
            showMessage = true;
            comment("There is no applicant email associated to this permit. Permit Coordinator has been notified via email to contact this applicant directly.");
            showMessage = showMessageDefault;
        }
    }
}

function getResubmitFileName(documentModel,fileNameArray) {
	logDebug(documentModel["fileName"]);
	var parentFileName = "";
	var parentDocSeq = documentModel.getParentSeqNbr();
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null) {
		//Get parent document fileName
		parentFileName = parentDocModel.getOutput().getFileName();
		logDebug("<font color='blue'>The original document file name is " + parentFileName + "</font>");
	}
	if (parentFileName != "") fileNameArray.push(parentFileName);
	return fileNameArray;
}

function emailCorrectionsRequiredNotification(wfTask,wfStatus,wfComment) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
		acaSite = acaSite.substr(0,acaSite.toUpperCase().indexOf("/ADMIN"));
		//getACARecordParam4Notification(emailParameters, acaSite);
		addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
		addParameter(emailParameters, "$$wfComment$$", wfComment);
		addParameter(emailParameters, "$$wfStatus$$", wfStatus);
		addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

		var applicantEmail = "";
		var assignedTo = currentUserID;
		var assignedToEmail = "";
		var assignedToFullName = "";
		var contObj = {};
		contObj = getContactArray(capId);
		if(typeof(contObj) == "object") {
			for (co in contObj) {
				if(contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null) applicantEmail += contObj[co]["email"] + ";";
			}
		}
		
		addParameter(emailParameters,"$$applicantEmail$$",applicantEmail);

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(applicantEmail != "") {
			if(appMatch("eReview/*/*/*")) var emailTemplate = "WTUA_CONTACT NOTIFICATION_INTERIM";
			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
		}
		else {
			if(applicantEmail == "" && assignedToEmail != "") {
			var emailTemplate = "WTUA_INTERNAL NOTIFICATION_INTERIM";
			sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
			showMessage = true;
			comment("There is no applicant email associated to this permit. A notification regarding this workflow task status update has not been sent via email. Please contact this applicant directly.");
			}
		}
}
//05-2020 not using this - be careful of what gets passed into this function - see emailReviewCompleteNotification
function emailReviewConsolidationNotification(wfStatus,revisionStatus,approvedStatus,completeStatus,docGroupArray) {
		showMessageDefault = showMessage;
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);

		var assignedTo = getAssignedToStaff();
		var assignedToEmail = "";
		var assignedToFullName = "";

		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);

		if(assignedToEmail != "") {
		var emailTemplate = "WTUA_INTERNAL NOTIFICATION_REVIEWCONSOLIDATION";
		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);			
		}
}
//05-2020 added for Pending Applicant - for wfComment to work, do not pass it into the function.
function emailPendingApplicantNotification(wfTask, wfStatus) {
    //populate email notification parameters
    var emailSendFrom = "";
    var emailSendTo = "";
    var emailCC = "";
    var emailParameters = aa.util.newHashtable();
    var fileNames = [];

    getRecordParams4Notification(emailParameters);
    getAPOParams4Notification(emailParameters);
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
    //getACARecordParam4Notification(emailParameters, acaSite);
    addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaSite));
    addParameter(emailParameters, "$$wfComment$$", wfComment);
    addParameter(emailParameters, "$$wfStatus$$", wfStatus);
    addParameter(emailParameters, "$$ShortNotes$$", getShortNotes());

    var applicantEmail = "";
    var assignedTo = currentUserID;
    var assignedToEmail = "";
    var assignedToFullName = "";
    var contObj = {};
    contObj = getContactArray(capId);
    if (typeof(contObj) == "object") {
        for (co in contObj) {
            if (contObj[co]["contactType"] == "Applicant" && contObj[co]["email"] != null)
                applicantEmail += contObj[co]["email"] + ";";
        }
    }

    addParameter(emailParameters, "$$applicantEmail$$", applicantEmail);

    if (assignedTo != null) {
        assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
        if (!matches(aa.person.getUser(assignedTo).getOutput().getEmail(), undefined, "", null)) {
            assignedToEmail = aa.person.getUser(assignedTo).getOutput().getEmail();
        }
    }
    addParameter(emailParameters, "$$assignedToFullName$$", assignedToFullName);
    addParameter(emailParameters, "$$assignedToEmail$$", assignedToEmail);

    if (applicantEmail != "") {
        //if (appMatch("eReview/*/*/*"))
            var emailTemplate = "WTUA_CONTACT NOTIFICATION_PEND APPL";
        sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
    } else {
        if (applicantEmail == "" && assignedToEmail != "") {
            var emailTemplate = "WTUA_INTERNAL NOTIFICATION_INTERIM";
            sendNotification(emailSendFrom, emailSendTo, emailCC, emailTemplate, emailParameters, fileNames);
            showMessage = true;
            comment("There is no applicant email associated to this permit. A notification regarding this workflow task status update has not been sent via email. Please contact this applicant directly.");
        }
    }
}
function doResubmitActions(documentModel,docGroups,docCategories,routingTask,routingResubmittalStatus,originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit) {
	afterResubmitParentDocument(originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit);
	disableToBeResubmit(documentModel["documentNo"]);
        //5-2020 per business updated to not send emails internally, and added Record Status update for ease of Record filtering - db   
        //emailDocResubmitNotification(docGroups,docCategories);
}

function afterResubmitParentDocument(originalDocStatusOnResubmit,parentDocStatusOnResubmit,resubmitDocStatusOnResubmit)
{
	var docModelList = aa.env.getValue("DocumentModelList");
	//var originalDocStatusOnResubmit = "Resubmitted";
	//var parentDocStatusOnResubmit = "Resubmitted";
	//var resubmitDocStatusOnResubmit = "Uploaded";
	var it = docModelList.iterator();
	while(it.hasNext())
	{
		var docModel = it.next();
		if(docModel == null)
		{
			aa.print("docModel is null");
			break;
		}
		//Set resubmit document status as "Uploaded"
		docModel.setDocStatus(resubmitDocStatusOnResubmit);
		var affectResubmitDocNum = aa.document.updateDocument(docModel);
		if(affectResubmitDocNum != null && affectResubmitDocNum.getOutput() != null && affectResubmitDocNum.getOutput() > 0)
		{
			aa.print("The resubmit document status has been set to " + resubmitDocStatusOnResubmit);
		}
/*		//Get all original document associations by resubmit document model.
		var originalDocModel = aa.document.getOriginalDoc(docModel);
		if(originalDocModel != null && originalDocModel.getOutput() != null)
		{
		    //Set original document status as "Resubmitted"
			originalDocModel.getOutput().setDocStatus(originalDocStatusOnResubmit)
			var affectOriginalDocNum = aa.document.updateDocument(originalDocModel.getOutput());
			if(affectOriginalDocNum != null && affectOriginalDocNum.getOutput() != null && affectOriginalDocNum.getOutput() > 0)
			{
				aa.print("The original document status has been set to " + originalDocStatusOnResubmit);
			}
		}
*/		
		//Get parent document associations by resubmit document model.
		var parentDocSeq = docModel.getParentSeqNbr();
		var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
		if(parentDocModel != null && parentDocModel.getOutput() != null)
		{
		    //Set parent document status as "Resubmitted"
			parentDocModel.getOutput().setDocStatus(parentDocStatusOnResubmit)
			var affectParentDocNum = aa.document.updateDocument(parentDocModel.getOutput());
			if(affectParentDocNum != null && affectParentDocNum.getOutput() != null && affectParentDocNum.getOutput() > 0)
			{
				aa.print("The parent document status has been set to " + parentDocStatusOnResubmit);
			}
		}
	}
}

function disableToBeResubmit(documentID)
{
	//get current document model by documentID
	var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();
	
	if ("RESUBMIT".equals(adsDocumentModel.getCategoryByAction()))
	{
		//get parent seq number
		var checkInDocumentId = adsDocumentModel.getParentSeqNbr();
		if(checkInDocumentId != null || !"".equals(checkInDocumentId))
		{
			//get check-in document by documentID
			var checkInDocument = aa.document.getDocumentByPK(checkInDocumentId).getOutput();
			
			//set original check-in document model's resubmit is false
			checkInDocument.setResubmit(false);
			
			//update original check-in document model
			aa.document.updateDocument(checkInDocument);
		}
	}
}

function emailDocUploadNotification(docGroups,docCategories) {
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();
	
	for (dl in newDocModelArr) {
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories) && matches(newDocModelArr[dl]["categoryByAction"],null)) {
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}
	
	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var assignedToFullName = "";
		var assignedToEmail = "";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}	
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);

        //build paramters for DigEplan URL
		var digEplanUrl = lookup("EXTERNAL_DOC_REVIEW","WEB_SERVICE_URL");
		getDigEplanRecordUrl(digEplanUrl);
		getDigEplanRecordUrlParam4Notification(emailParameters,digEplanUrl);


		if(appMatch("eReview/*/*/*")) var emailTemplate = "DUA_INTERNAL NOTIFICATION_UPLOAD";

		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function emailDocResubmitNotification(docGroups,docCategories) {
	var docInfoList = [];
	var docInfoListString = "";
	var newDocModelArr = [];

	newDocModelArr = documentModelArray.toArray();
	
	for (dl in newDocModelArr) {
		if(exists(newDocModelArr[dl]["docGroup"],docGroups) && exists(newDocModelArr[dl]["docCategory"],docCategories) && matches(newDocModelArr[dl]["categoryByAction"],"RESUBMIT")) {
			docInfoList.push(" " + newDocModelArr[dl]["docCategory"] + ": " + newDocModelArr[dl]["fileName"]);
		}
	}
	
	if (docInfoList.length >0) {
		//populate email notification parameters
		var emailSendFrom = "";
		var emailSendTo = "";
		var emailCC = "";
		var emailTemplate = "";
		var emailParameters = aa.util.newHashtable();
		var fileNames = [];		
		
		getRecordParams4Notification(emailParameters);
		getAPOParams4Notification(emailParameters);
		var assignedToFullName = "";
		var assignedToEmail = "";
		var assignedTo = getAssignedToStaff();
		if(assignedTo != null) {
				assignedToFullName = aa.person.getUser(assignedTo).getOutput().getFirstName() + " " + aa.person.getUser(assignedTo).getOutput().getLastName();
				if(!matches(aa.person.getUser(assignedTo).getOutput().getEmail(),undefined,"",null)) {
					assignedToEmail =  aa.person.getUser(assignedTo).getOutput().getEmail();
				}	
		}
		addParameter(emailParameters,"$$assignedToFullName$$",assignedToFullName);
		addParameter(emailParameters,"$$assignedToEmail$$",assignedToEmail);
		docInfoListString = docInfoList.toString();
		addParameter(emailParameters,"$$docInfoList$$",docInfoListString);
		//build paramters for DigEplan URL
		var digEplanUrl = lookup("EXTERNAL_DOC_REVIEW","WEB_SERVICE_URL");
		getDigEplanRecordUrl(digEplanUrl);
		getDigEplanRecordUrlParam4Notification(emailParameters,digEplanUrl);
		
		if(appMatch("eReview/*/*/*")) emailTemplate = "DUA_INTERNAL NOTIFICATION_RESUBMIT";

		sendNotification(emailSendFrom,emailSendTo,emailCC,emailTemplate,emailParameters,fileNames);
	}
}

function getDigEplanRecordUrl(digEplanUrl) {
	
	var digEplanRecordUrl = "";

   	digEplanRecordUrl = digEplanUrl;   
	digEplanRecordUrl += "" + capId.getCustomID();
	
   	return digEplanRecordUrl;
}

function getDigEplanRecordUrlParam4Notification(params,digEplanUrl) {
	// pass in a hashtable and it will add the additional parameters to the table

	addParameter(params, "$$digEplanRecordUrl$$", getDigEplanRecordUrl(digEplanUrl));
	
	return params;	
}

function synchronizeDocFileNames() {
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("*Document Name: " + docArray[d].getDocName());
			//logDebug("*File Name: " + docArray[d].getFileName());
			if(docArray[d].getDocName() != docArray[d].getFileName()) {
				var docNameExt = null;
				//logDebug("*-------------*");
				//logDebug("* Document Name: " + docArray[d].getDocName());
				//logDebug("* File Name: " + docArray[d].getFileName());
				
				var fileTypeIndex = docArray[d].getFileName().lastIndexOf(".");
				if(fileTypeIndex>1) var fileExt = docArray[d].getFileName().substring(docArray[d].getFileName().lastIndexOf("."));
				//logDebug("fileExt: " + fileExt);				
				
				var docTypeIndex = docArray[d].getDocName().lastIndexOf(".");
				if(docTypeIndex>1) {
					var docExt = docArray[d].getDocName().substring(docArray[d].getDocName().lastIndexOf("."));
					if(docExt != fileExt) {
						docNameExt = docArray[d].getDocName() + fileExt;
						docArray[d].setDocName(docArray[d].getDocName() + fileExt);
						//logDebug("---UPDATE DOCNAME TO : " + docNameExt);
					} else {
						docNameExt = docArray[d].getDocName();
						//logDebug("----DOCNAME DOESN'T CHANGE : " + docNameExt);
						}
				}
				if(docTypeIndex == -1) {
					docNameExt = docArray[d].getDocName() + fileExt;
					docArray[d].setDocName(docArray[d].getDocName() + fileExt);
					//logDebug(" ---UPDATE DOCNAME TO : " + docNameExt);
				}			

				if(docNameExt != docArray[d].getFileName()){
					logDebug("<font color='blue'>---UPDATE FILE NAME TO: " + docNameExt + "</font>" );
					docArray[d].setFileName(docNameExt);
				}
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}	
			
		}
	}
}

function updateCheckInDocStatus(documentModel,revisionsRequiredDocStatus,approvedStatus,approvedFinalDocStatus) {
	var docAutoStatus = documentModel["docStatus"]; //logDebug("Original Doc Status: " + docAutoStatus);
	//var docDescription = String(documentModel["docDescription"]); //logDebug("docDescription: " + docDescription);
	var docAutoStatus = getParentDocStatus(documentModel); //logDebug("Parent Doc Status: " + docAutoStatus);
	if(docAutoStatus == revisionsRequiredDocStatus) docAutoStatus = revisionsRequiredDocStatus;
	if(docAutoStatus == approvedStatus) docAutoStatus = approvedFinalDocStatus;
    if(docAutoStatus == approvedFinalDocStatus) docAutoStatus = approvedFinalDocStatus;
	//logDebug("docAutoStatus: " + docAutoStatus);
	
	if(docAutoStatus != documentModel["docStatus"]) {
		documentModel.setDocStatus(docAutoStatus);
		documentModel.setRecStatus("A");
		documentModel.setSource(getVendor(documentModel.getSource(), documentModel.getSourceName()));
		updateDocResult = aa.document.updateDocument(documentModel);
		logDebug("<font color='blue'>Document Status updated to " + docAutoStatus + "</font>");
	} else {
		logDebug("Document Status not updated.");
	}
	
}

function updateDocPermissionsbyCategory(documentModel,updateCategory) {
	if (documentModel["docCategory"] != updateCategory) {
		documentModel.setDocCategory(updateCategory);
		aa.document.updateDocument(documentModel);
		logDebug("<font color='blue'>Document Category updated to " + updateCategory + "</font>");
	} else {
		logDebug("Document Category not updated.");
	}

}


function getParentDocCategory(documentModel) {
	var parentDocCategory = null;
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		//Get parent document category
		parentDocCategory = parentDocModel.getOutput().getDocCategory();
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent category is " + parentDocCategory);
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent name is " + parentDocModel.getOutput().getDocName());
	}
	return parentDocCategory;
}

function getParentDocStatus(documentModel) {
	var parentDocStatus = null;
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		//Get parent document status
		parentDocStatus = parentDocModel.getOutput().getDocStatus();
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent status is " + parentDocStatus);
		//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent name is " + parentDocModel.getOutput().getDocName());
	}
	return parentDocStatus;
}

function updateParentDocStatus(documentModel,updateDocStatus) {
	var parentDocModel = null;
	var parentDocSeq = documentModel.getParentSeqNbr();
	//logDebug(documentModel.getDocumentNo() + ": " + documentModel.getDocName() + " parent seq # is " + parentDocSeq);
	var parentDocModel = aa.document.getDocumentByPK(parentDocSeq);
	if(parentDocModel != null && parentDocModel.getOutput() != null)
	{
		logDebug("<font color='blue'>Set Parent Document Status</font>");
		//Set parent document status
		parentDocStatus = parentDocModel.getOutput().setDocStatus(updateDocStatus);
		aa.document.updateDocument(parentDocModel);

	}
}

function checkForPendingReviews(reviewTasksArray,reviewTaskStatusPendingArray) //function checks for all review tasks resulted and/or completed
	{
	var tasksPending = false;
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj)
		{
		var fTask = wfObj[i];
 		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray))
			{
			//logDebug("Workflow Task: " + fTask.getTaskDescription().toUpperCase() + " Active: " + fTask.getActiveFlag() + " Status: " + fTask.getDisposition())
			if(fTask.getActiveFlag() == "Y" && exists(fTask.getDisposition(),reviewTaskStatusPendingArray)) tasksPending = true;
			}		
		}
		return tasksPending;
}

function updatePlanReviewTasks4Resubmittal(reviewTasksArray,taskStatusArray,reviewTaskResubmittalReceivedStatus) {
	var workflowResult = aa.workflow.getTasks(capId);
 	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
  	else
  	  	{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); return false; }
	
	for (i in wfObj) {
		var fTask = wfObj[i];
		if (exists(fTask.getTaskDescription().toUpperCase(),reviewTasksArray) && fTask.getDisposition() != null && exists(fTask.getDisposition().toUpperCase(),taskStatusArray)) {
			if(!isTaskActive(fTask.getTaskDescription())) {activateTask(fTask.getTaskDescription());}
			if(!isTaskStatus(fTask.getTaskDescription(),reviewTaskResubmittalReceivedStatus)) updateTask(fTask.getTaskDescription(),reviewTaskResubmittalReceivedStatus,"Documents Resubmitted","Documents Resubmitted");
		}		
	}
}

function digEplanPreCache(client,capId)
{
	var soapresp = "DigEplan precache did not work";
   
	if(getEnvironment() == "NON-PROD") {
		soapresp = aa.util.httpPost('https://api.pre-prod.digeplan.com/api/precache/folders?product=app&client=' + client + '&originalFolderId=' + capId,'').getOutput();
		logDebug("<font color='green'>Calling PRE-PROD V5 API </font>");
	}
	else {
		soapresp = aa.util.httpPost('https://api.usw.digeplan.com/api/precache/folders?product=app&client=' + client + '&originalFolderId=' + capId,'').getOutput();
		logDebug("<font color='green'>Calling PROD V5 API </font>");
	}
	return soapresp;
}

function getEnvironment() {
                var environment = "";
                var acaSite = lookup("ACA_CONFIGS","ACA_SITE");
                if(acaSite.indexOf("https://aca-prod.accela.com/chesterfield/") == 0) {environment = "PROD";}
					else {environment = "NON-PROD";}

                return environment;
}

function enableToBeResubmit(documentID,docStatusArray)
{
	//get current document model by documentID
	var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();
	
	if (exists(adsDocumentModel.getDocStatus(),docStatusArray))
	{
		//set this doc resubmit
		adsDocumentModel.setResubmit(true);
		adsDocumentModel.setCategoryByAction("CHECK-IN");
		adsDocumentModel.setAllowActions("RESBUMIT;ACA_RESUBMIT");
		adsDocumentModel.setDocStatus("Review Complete-Comments");
			
		//update this document model
		aa.document.updateDocument(adsDocumentModel);
	}
}

function disableResubmit(documentID,docStatusArray)
{
     //get current document model by documentID
     var adsDocumentModel = aa.document.getDocumentByPK(documentID).getOutput();
    
     if (exists(adsDocumentModel.getDocStatus(),docStatusArray))
     {
           //set this doc resubmit
           adsDocumentModel.setResubmit(false);
           //adsDocumentModel.setCategoryByAction("CHECK-IN");
           //adsDocumentModel.setAllowActions("RESBUMIT;ACA_RESUBMIT");
           //adsDocumentModel.setDocStatus("Pending Resubmittal");
               
           //update this document model
        aa.document.updateDocument(adsDocumentModel);
        logDebug("<font color='blue'>Doc RESUBMIT disabled: " + adsDocumentModel["docName"] + "</font>");
     }
}

/*--------END DIGEPLAN EDR CUSTOM FUNCTIONS---------*/