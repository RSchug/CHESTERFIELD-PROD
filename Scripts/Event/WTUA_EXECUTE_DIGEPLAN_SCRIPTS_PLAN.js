//WTUA_EXECUTE_DIGEPLAN_SCRIPTS
logDebug("Inside WTUA_EXECUTE_DIGEPLAN_SCRIPTS_PLAN");

/*-----DEFINE VARIABLES FOR DIGEPLAN SCRIPTS-----*/
//Document Specific Variables for PLANNING
var docGroupArrayModule = ["GENERAL","CC-PLN-ZC","CC-PLN-VP","CC-PLN-HP","CC-PLN-SS","CC-PLN-PP"];
var docTypeArrayModule = ["Plans","Survey Plat","Elevations or Renderings","Site Plan/Master Plan","Concept/Master Plan","Other","Access Plan","Improvement Plan","Legal Documentation","Plat","Validation Plan Advisory Certificate","Final Plans","Plats","Master Plan"];

//Workflow Specific variables for Planning
var reviewTasksArray = ["PLANNING REVIEW", "AIRPORT REVIEW", "ASSESSOR REVIEW", "BUILDING INSPECTION REVIEW", "COUNTY LIBRARY REVIEW", "HEALTH DEPARTMENT REVIEW", "CDOT REVIEW", "ECONOMIC DEVELOPMENT REVIEW", "ENVIRONMENTAL ENGINEERING", "FIRE AND LIFE SAFETY REVIEW", "GIS-IST REVIEW", "GIS-EDM UTILITIES REVIEW", "PARKS AND RECREATION REVIEW", "POLICE REVIEW", "REAL PROPERTY REVIEW", "SCHOOLS CONSTRUCTION REVIEW", "SCHOOLS RESEARCH AND PLANNING REVIEW", "UTILITIES REVIEW", "VDOT REVIEW", "WATER QUALITY REVIEW", "CHESTERFIELD HISTORICAL SOCIETY REVIEW", "COMMUNITY ENHANCEMENT REVIEW"];
var taskStatusArray = ["APPROVED", "APPROVED WITH CONDITIONS", "REVISIONS REQUESTED", "SUBSTANTIAL APPROVAL", "TABLE REVIEW ELIGIBLE"];
var routingTask = ["Review Distribution"];
var routingStatusArray = ["Routed for Review","Manual Routing"];
var resubmittalRoutedStatusArray = ["Routed for Review","Manual Routing"];
var reviewTaskResubmittalReceivedStatus = "Revisions Received";
var reviewTaskResubmitStatus = ["REVISIONS REQUESTED", "SUBSTANTIAL APPROVAL", "TABLE REVIEW ELIGIBLE"];
var reviewTaskApprovedStatusArray = ["Approved", "Approved with Conditions"]; //Not currently used, but could be for a review task approval email notification
var reviewTaskStatusPendingArray = [null, "", undefined, "Revisions Received", "In Review"];
var consolidationTask = ["Review Consolidation"];
var ResubmitStatus = ['RR-Substantial Approval', 'RR-Table Review', 'RR-Revisions Requested', 'RR-Staff and Developer Meeting','Revisions Requested','Submit Signed Plat'];
var ApprovedStatus = ['Review Complete','Approved','Plans Approved','Ready for BZA','Move to CPC','Authorized to Proceed','County Signatures Complete','Move to BOS'];

/*-----START DIGEPLAN EDR SCRIPTS-----*/

//Set "Uploaded" documents to inReviewDocStatus on routing
if (exists(wfTask,routingTask) && exists(wfStatus,routingStatusArray)) {
    logDebug("<font color='blue'>Inside workflow: " + wfTask + "</font>");
    var docArray = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
	if (docArray != null && docArray.length > 0) {
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

//Update Doc Type to Commnents and send email to Applicant on consolidationTask Resubmit
if (exists(wfTask,consolidationTask) && exists(wfStatus,ResubmitStatus)) {
	logDebug("<font color='blue'>Inside workflow: " + wfTask + "</font>");
	//02-2021 Moved here so it fires without consieration of DigEplan Mark-up
	emailReviewCompleteNotification(ResubmitStatus,ApprovedStatus,docGroupArrayModule);
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
			}
			if (!matches(docArray[d]["docStatus"],"Review Complete-Comments","Review Complete")) {
				if(docArray[d].getAllowActions() != null) disableResubmit(docArray[d].getDocumentNo(),['Revisions Requested']);;
			}
			//Not going to work at this wftask... will have to have another event turn this on...???
			if (exists(docArray[d]["docCategory"],"Comments") && docArray[d]["fileUpLoadBy"] != digEplanAPIUser) {
				logDebug("<font color='blue'>Inside docType docStatus: " + docArray[d]["docCategory"] + docArray[d]["docStatus"] + "</font>");
				enableToBeResubmit(docArray[d]["documentNo"],["Comments"]);
			}
		}
	}
}

//Update Document Statuses/Category to Approved on consolidationTask/ApprovedStatus
if (exists(wfTask,consolidationTask) && exists(wfStatus,ApprovedStatus)) {
	logDebug("<font color='blue'>Inside workflow and status: " + wfTask+wfStatus + "</font>");
    docArray = aa.document.getCapDocumentList(capId, currentUserID).getOutput();
	//02-2021 Moved here so it fires without consieration of DigEplan Mark-up
	emailReviewCompleteNotification(ResubmitStatus,ApprovedStatus,docGroupArrayModule);
    if (docArray != null && docArray.length > 0) {
        for (d in docArray) {
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
			}
		/*  if (docArray[d]["docName"].indexOf("Sheet Report") == 0 && docArray[d]["docStatus"] == "Uploaded") {
				logDebug("<font color='green'>*Sheet Report DocumentID: " + docArray[d]["documentNo"] + "</font>");
				docArray[d].setDocGroup("CC-PLN");
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