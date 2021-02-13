//WTUA_EXECUTE_DIGEPLAN_SCRIPTS
logDebug("Inside WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BUILD");

/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables for Building Module
var docGroupArrayModule = ["GENERAL","CC-EE-GENERAL","CC-EE-BMP","CC-EE-PR","CC-EE-LD","CC-UTL-GENERAL"];
var docTypeArrayModule = ["Plan","Other","Plans","Plat","Site Plan / Key Plan"];

//Workflow Specific variables
var reviewTasksArray = ["STRUCTURAL REVIEW","NON STRUCTURAL REVIEW","MECHANICAL REVIEW","PLUMBING REVIEW","ELECTRICAL REVIEW","GAS REVIEW","ADDRESSING REVIEW","ENVIRONMENTAL ENGINEERING REVIEW","PLANNING REVIEW","UTILITIES REVIEW","BUDGET AND MANAGEMENT REVIEW","HEALTH DEPARTMENT REVIEW"];
var taskStatusArray = ["APPROVED","APPROVED WITH CONDITIONS","CORRECTIONS REQUIRED","NOT REQUIRED"];
var routingTask = ["Review Distribution","Application/Plat Submittal","Review Consolidation"]; //added rev cons for EE records
var routingStatusArray = ["Routed for Review","Distributed for Review","Revisions Received"];
var resubmittalRoutedStatusArray = ["Routed for Review","Distributed for Review"];
var reviewTaskResubmittalReceivedStatus = ["Revisions Received"];
var reviewTaskResubmitStatus = ["Corrections Required"];
var reviewTaskApprovedStatusArray = ["Approved","Approved with Conditions"]; //Not currently used, but could be for a review task approval email notification
var reviewTaskStatusPendingArray = [null,"",undefined,"Revisions Received","In Review"];
var consolidationTask = ["Review Consolidation"];
var ResubmitStatus = ["Corrections Required","Revisions Requested"];
var ApprovedStatus = ["Approved","Complete","Approved with Conditions"];

/*-----START DIGEPLAN EDR SCRIPTS-----*/

//Set "Uploaded" documents type/status to inReviewDocStatus upon routing - 01-2021 added consolidationTask for EE and the rev received because they only use that step for this.
if(exists(wfTask,routingTask) && exists(wfStatus,routingStatusArray)) {
	logDebug("<font color='blue'>Inside workflow: " + wfTask + "</font>");
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
            if (exists(docArray[d]["docCategory"],docTypeArrayModule) && docArray[d]["docStatus"] == "Uploaded" && docArray[d]["fileUpLoadBy"] != digEplanAPIUser) {
				logDebug("<font color='blue'>Update document statuses to " + inReviewDocStatus + "</font>");
				docArray[d].setDocStatus(inReviewDocStatus);
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
			}
		}
	}	
}

//send email to Applicant on consolidationTask/consolidationResubmitStatus and update mark up to type to Comments 
if(exists(wfTask,consolidationTask) && exists(wfStatus,ResubmitStatus)) {
	logDebug("<font color='blue'>Inside workflow: " + wfTask + "</font>");
//Update the mark up report to and add Comment on end of Doc Status
	var docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			if(docArray[d]["docStatus"] == "Review Complete" && docArray[d]["fileUpLoadBy"] == digEplanAPIUser) {
				logDebug("<font color='blue'>Inside if Rev Comp & digEplanAPIUser: " + docArray[d]["docStatus"] + "</font>");
				enableToBeResubmit(docArray[d]["documentNo"],["Review Complete"]);
				docArray[d].setDocStatus("Review Complete-Comments");
				aa.document.updateDocument(docArray[d]);
				//updateDocPermissionsbyCategory(docArray[d],"Comments");  no work with laserfiche
				enableToBeResubmit(docArray[d]["documentNo"],["Review Complete-Comments"]);
				emailReviewCompleteNotification(ResubmitStatus,ApprovedStatus,docGroupArrayModule);
			}
			if (!matches(docArray[d]["docStatus"],"Review Complete-Comments","Review Complete")) {
				if(docArray[d].getAllowActions() != null) disableResubmit(docArray[d].getDocumentNo(),['Revisions Requested']);;
			}
		}
	}
}

//Update Approved Document based on consolidationTask/ApprovedStatus and email applicant
if(exists(wfTask,consolidationTask) && exists(wfStatus,ApprovedStatus)) {
	logDebug("<font color='blue'>Inside workflow: " + wfTask + "</font>");
	docArray = aa.document.getCapDocumentList(capId,currentUserID).getOutput();
	if(docArray != null && docArray.length > 0) {
		for (d in docArray) {
			//logDebug("DocStatus: " + docArray[d]["docStatus"]);
			//logDebug("DocumentGroup: " + docArray[d]["docGroup"]);
			//logDebug("DocName: " + docArray[d]["docName"]);
			//logDebug("DocumentID: " + docArray[d]["documentNo"]);
			if(docArray[d]["docStatus"] == "Review Complete" && docArray[d]["fileUpLoadBy"] == digEplanAPIUser) {
				logDebug("<font color='blue'>Inside Doc Num: " + docArray[d]["documentNo"] + "</font>");
				docArray[d].setDocStatus("Review Complete - Approved");
				aa.document.updateDocument(docArray[d]);
			}
			if(exists(getParentDocStatus(docArray[d]),approvedDocStatus,approvedPendingDocStatus)) {
				logDebug("<font color='blue'>Inside Doc Num: " + docArray[d]["documentNo"] + "</font>");
				updateCheckInDocStatus(docArray[d],revisionsRequiredDocStatus,approvedDocStatus,approvedFinalDocStatus);
				//updateDocPermissionsbyCategory(docArray[d],docInternalCategory);
				// moving to WTUA: Building Permit Issued - emailReviewCompleteNotification(ResubmitStatus,ApprovedStatus,docGroupArrayModule);
			}
		/*	if(docArray[d]["docName"].indexOf("Sheet Report") == 0 && docArray[d]["docStatus"] == "Uploaded") {
				logDebug("<font color='green'>*Sheet Report DocumentID: " + docArray[d]["documentNo"] + "</font>");
				docArray[d].setDocGroup("GENERAL");
				docArray[d].setDocStatus(approvedPendingDocStatus);
				docArray[d].setDocCategory(docInternalCategory);
				docArray[d].setDocName(capIDString + "_Approved_Plans_Report.pdf");
				docArray[d].setRecStatus("A");
				docArray[d].setSource(getVendor(docArray[d].getSource(), docArray[d].getSourceName()));
				updateDocResult = aa.document.updateDocument(docArray[d]);
				logDebug("<font color='blue'>Document " + docArray[d]["documentNo"] + " updated </font>");
			} */
		}
	}
}
synchronizeDocFileNames();
/*-----END DIGEPLAN EDR SCRIPTS-----*/