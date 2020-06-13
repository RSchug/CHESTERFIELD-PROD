//WTUA_EXECUTE_DIGEPLAN_SCRIPTS_EREVIEW1
logDebug("Inside WTUA_EXECUTE_DIGEPLAN_SCRIPTS_EREVIEW1");

/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables for EREVIEW1
var docGroupArrayModule = ["EREVIEW"];
var docTypeArrayModule = ["Plans","Supporting Documents","Application","Calculation","Correspondance","Code Modification","Image","Legal Documentation","Plat","Comments","Final Plans"];

//Workflow Specific variables for EREVIEW1
var reviewTasksArray = ["STRUCTURAL REVIEW","NON-STRUCTURAL REVIEW","MECHANICAL REVIEW","PLUMBING REVIEW","ELECTRICAL REVIEW","GAS REVIEW","ADDRESSING REVIEW","ENVIRONMENTAL ENGINEERING REVIEW","PLANNING REVIEW","UTILITIES REVIEW","BUDGET AND MANAGEMENT REVIEW","HEALTH DEPARTMENT REVIEW"];
var taskStatusArray = ["APPROVED","APPROVED WITH CONDITIONS","CORRECTIONS REQUIRED","NOT REQUIRED"];
var routingTask = "Review Distribution";
var routingStatusArray = ["Routed for Review"];
var resubmittalRoutedStatusArray = ["Routed for Review"];
var reviewTaskResubmittalReceivedStatus = "Revisions Received";
var reviewTaskResubmitStatus = "Corrections Required";
var reviewTaskApprovedStatusArray = ["Approved","Approved with Conditions"]; //Not currently used, but could be for a review task approval email notification
var reviewTaskStatusPendingArray = [null,"",undefined,"Revisions Received","In Review"];
var consolidationTask = "Review Consolidation";
var ResubmitStatus = "Corrections Required";
var ApprovedStatus = "Approved";

/*-----START DIGEPLAN EDR SCRIPTS-----*/

//Set "Uploaded" documents by group/category to inReviewDocStatus on routing
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && matches(wfTask,routingTask) && exists(wfStatus,routingStatusArray)) {
	logDebug("<font color='blue'>Update document statuses to " + inReviewDocStatus + "</font>");
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			if(exists(docArray[d]["docGroup"],docGroupArrayModule) && exists(docArray[d]["docCategory"],docTypeArrayModule) && docArray[d]["docStatus"] == "Uploaded" && docArray[d]["fileUpLoadBy"] != digEplanAPIUser) {
				docArray[d].setDocStatus(inReviewDocStatus);
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}
		}
	}	
}

//update required reviewTaskArray tasks to reviewTaskResubmittalReceivedStatus
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfStatus,resubmittalRoutedStatusArray)) {
	updatePlanReviewTasks4Resubmittal(reviewTasksArray,taskStatusArray,reviewTaskResubmittalReceivedStatus);
}

/*send email to Applicant on reviewTaskResubmitStatus - business on 05-2020 wanted this turned off
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfTask.toUpperCase(),reviewTasksArray) && wfStatus == reviewTaskResubmitStatus) {
	emailCorrectionsRequiredNotification(wfTask,wfStatus,wfComment);
}*/

//update consolidationTask when all required reviewTasksArray tasks have been completed
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && exists(wfTask.toUpperCase(),reviewTasksArray) && isTaskActive(consolidationTask) && checkForPendingReviews(reviewTasksArray,reviewTaskStatusPendingArray) == false) {
	updateTask(consolidationTask,"Ready for Consolidation","","");
//db updated per buisness request 4-27-2020	
        //emailReviewConsolidationNotification();
}

//send email to Applicant on consolidationTask/consolidationResubmitStatus or consolidationTask/ApprovedStatus and update type to Comment
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && wfTask == consolidationTask && matches(wfStatus,ResubmitStatus,ApprovedStatus)) {
	emailReviewCompleteNotification(ResubmitStatus,ApprovedStatus,docGroupArrayModule);
//Update the mark up report to Comment Doc Type
	if(edrPlansExist(docGroupArrayModule,docTypeArrayModule)) {
		var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
		if(docArray != null && docArray.length > 0) {
			for (d in docArray) {
				if(docArray[d]["docStatus"] == "Review Complete") {
					updateDocPermissionsbyCategory(docArray[d],"Comments");
				}
			}
		}
	}
}

//Update Approved Document Statuses/Category on consolidationTask/ApprovedStatus
if(edrPlansExist(docGroupArrayModule,docTypeArrayModule) && matches(wfTask,consolidationTask) && matches(wfStatus,ApprovedStatus)) {
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("DocumentID: " + docArray[d]["documentNo"]);
			//logDebug("DocumentGroup: " + docArray[d]["docGroup"]);
			//logDebug("DocName: " + docArray[d]["docName"]);
			//logDebug("DocumentID: " + docArray[d]["documentNo"]);
			if((exists(docArray[d]["docGroup"],docGroupArrayModule) || docArray[d]["docGroup"] == null) && matches(docArray[d]["docStatus"],reviewCompleteDocStatus)) {
				if(matches(getParentDocStatus(docArray[d]),approvedDocStatus,approvedPendingDocStatus)) {
					updateCheckInDocStatus(docArray[d],revisionsRequiredDocStatus,approvedDocStatus,approvedFinalDocStatus);
					updateDocPermissionsbyCategory(docArray[d],docInternalCategory);
				}
				if(docArray[d]["docName"].indexOf("Sheet Report") == 0 && docArray[d]["docStatus"] == "Uploaded") {
					logDebug("<font color='green'>*Sheet Report DocumentID: " + docArray[d]["documentNo"] + "</font>");
					docArray[d].setDocGroup("EREVIEW");
					docArray[d].setDocStatus(approvedPendingDocStatus);
					docArray[d].setDocCategory(docInternalCategory);
					docArray[d].setDocName(capIDString + "_Approved_Plans_Report.pdf");
					docArray[d].setRecStatus("A");
					docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
					updateDocResult = aa.document.updateDocument(docArray[d]);
					logDebug("<font color='blue'>Document " + docArray[d]["documentNo"] + " updated </font>");
				}
			}
		}
	}
}

synchronizeDocFileNames();

/*-----END DIGEPLAN EDR SCRIPTS-----*/