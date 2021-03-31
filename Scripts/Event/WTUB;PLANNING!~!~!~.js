/*
Script# 7p
Purpose : checking for conditions on parcels at each record type and at their final step
PLEASE BE ADVISED - Code was removed for Building Records.  Added wfStatus of Create Conditions and Close Case will circumvent these scripts
 */
try {
	if (matches(wfTask, 'BOS Hearing') && matches(wfStatus, 'Approved')) {
		if (appMatch('*/*/RPAException/*') && (parcelHasCondition_TPS('RPA', 'Applied') || parcelHasCondition_TPS('RPA', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied RPA Exception Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/ManufacturedHomes/*') && (parcelHasCondition_TPS('Manufactured', 'Applied') || parcelHasCondition_TPS('Manufactured', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Manufactured Home Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/SubstantialAccord/*') && (parcelHasCondition_TPS('Substantial', 'Applied') || parcelHasCondition_TPS('Substantial', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Substantial Accord Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/HistoricPreservation/*') && (parcelHasCondition_TPS('Historic', 'Applied') || parcelHasCondition_TPS('Historic', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Historic Preservation Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
	}
	if (matches(wfTask, 'Case Complete') && matches(wfStatus, 'Closed')) {
		if (appMatch('*/*/Preliminary/*') && (parcelHasCondition_TPS('Preliminary', 'Applied') || parcelHasCondition_TPS('Preliminary', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Preliminary Plan Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/ConstructionPlan/*') && (parcelHasCondition_TPS('Construction', 'Applied') || parcelHasCondition_TPS('Construction', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Construction Plan Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/ParcelAcreage/*') && (parcelHasCondition_TPS('Acreage', 'Applied') || parcelHasCondition_TPS('Acreage', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Parcel Acreage Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/AdminVariance/*') && (parcelHasCondition_TPS('Admin Variance', 'Applied') || parcelHasCondition_TPS('Admin Variance', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Admin Variance Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/SpecialException/*') && (parcelHasCondition_TPS('Special Exception', 'Applied') || parcelHasCondition_TPS('Special Exception', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Special Exception Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/Variance/*') && (parcelHasCondition_TPS('Variance', 'Applied') || parcelHasCondition_TPS('Variance', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Variance Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/*/OverallConceptualPlan/*') && (parcelHasCondition_TPS('Overall Conceptual', 'Applied') || parcelHasCondition_TPS('Overall Conceptual', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Overall Conceptual Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/SitePlan/Schematics/*') && (parcelHasCondition_TPS('Schematics', 'Applied') || parcelHasCondition_TPS('Schematics', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Schematics Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/SitePlan/Major/*') && (parcelHasCondition_TPS('Major', 'Applied') || parcelHasCondition_TPS('Major', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Site Major Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
		else if (appMatch('*/SitePlan/Minor/*') && (parcelHasCondition_TPS('Minor', 'Applied') || parcelHasCondition_TPS('Minor', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Site Minor Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
	}
	if (matches(wfTask, 'GIS Update') && matches(wfStatus, 'Complete')) {
		if (appMatch('*/*/Final Plat/*') && (parcelHasCondition_TPS('Final', 'Applied') || parcelHasCondition_TPS('Final', 'Applied(Applied)'))) {
			showMessage = true;
			comment('The Parcel(s) seem to have still applied Final Plat Conditions? You will need to update those Condition(s) Status to Condition Met to proceed in the workflow');
			cancel = true;
		}
	}
	//86P
	if ((wfTask == 'Sign Posting' && wfStatus == 'Signs Removed') && (!matches(capStatus, 'Final Approval', 'Approved', 'Denied', 'Withdrawn'))) {
		showMessage = true;
		comment('<font size=small><b>Sign cannot be removed until the record status has Final Action.</b></font>');
		cancel = true;
	}
	//20P When AdHoc Task 'Signs Posted' Status is updated to Signs Posted and Adhoc Task 'IVR Message' current Status is not "Message Recorded" Then display error 'Message needs to be recorded before signs can be posted'. Do not stop the workflow, just show Message to end user.
	if (wfTask == 'Sign Posting' && wfStatus == 'Signs Posted') {
		if (!isTaskStatus_TPS('IVR Message','Message Recorded')) {
			showMessage = true;
			comment('<font size=small><b>Message needs to be recorded before signs can be posted.</b></font>');
			cancel = true;
		}
	}
//added this here for the Conditions - the cancel does not work in the WTUA	
	if (wfStatus == 'Create Conditions and Close Case') {
		logDebug("WTUB - Inside: " + wfStatus);
		var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
		var Parcels = capParcelResult.getOutput().toArray();
		if (Parcels[0]==undefined) {
			cancel = true; 
			showMessage = true; 
			comment("<span class='fontbold font14px'>Error: You do not have a Parcel on this record.</span>");
		}
	}
//Check for all Task complete before closing - db 01-2021
	if (matches(wfTask,'BOS Hearing','Case Complete','GIS Update') && matches(wfStatus,'Create Conditions and Close Case','Closed','Appeal','Complete')) {
		var alltaskinfo = allTasksComplete_Local();
		logDebug("alltaskinfo = " + alltaskinfo);
		if (allTasksComplete_Local() == false) {
			cancel = true;
			showMessage = true;
			comment("There appears to be Workflow Tasks that are still Active - please close them appropriately.");
		}
	}
//03-2021 added scripting for Code Schema Checking
	if (appMatch('*/SitePlan/*/*') || appMatch('*/Subdivision/*/*')) {
		if (matches(wfTask,'CPC Hearing','Case Complete','Review Consolidation') && matches(wfStatus,'County Signatures Complete','Create Conditions and Close Case','Closed','Appeal','Complete','CPC Approved','CPC Approved with Admin Review')) {
			if (AInfo['Subdivision Code'] == null || AInfo['Subdivision Name'] == null || AInfo['Development Code'] == null || AInfo['Development Name'] == null || AInfo['Community Code'] == null) {
				showMessage = true;
				comment('You cannot advance this workflow until the Subdivision, Development, and Community Code fields in the <b>Codes</b> area of the Data Fields are filled in appropriately. If a field is Not Applicable, you can mark it with NA.');
				cancel = true;
			}
		}
	}
/*	Could not get this to complete WTUB and then not update the due date in the BOS Hearing
	if ((appMatch('Planning/LandUse/AdminVariance/NA') || appMatch('Planning/LandUse/Variance/NA') || appMatch('Planning/LandUse/SpecialException/NA') || appMatch('Planning/LandUse/Appeal/NA')) &&
		matches(wfTask,'Review Consolidation','BZA Staff Report') && matches(wfStatus,'Ready for BZA','Complete') && isTaskActive('BZA Hearing')) {
			if (isTaskActive('BZA Staff Report')) {
				closeTask("BZA Staff Report","Complete","");  //put the cancel in the WTUB:Planning!LandUse
			}
			if (isTaskActive('Review Consolidation')) {
				closeTask("Review Consolidation","Complete","");
			}
	}
	if ((appMatch('Planning/LandUse/ManufacturedHomes/NA') || appMatch('Planning/LandUse/RPAException/NA')) && matches(wfTask,'Review Consolidation') && matches(wfStatus,'Complete','Review Complete') && isTaskActive('BOS Hearing')) {
		closeTask("Review Consolidation","Complete","");
	} */

} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}

function allTasksComplete_Local() // added here for Chesterfield - trying to debug
	{
	var ignoreArray = new Array();
	for (var i=1; i<arguments.length;i++) 
		ignoreArray.push(arguments[i])

	// returns true if any of the subtasks are active
	var taskResult = aa.workflow.getTasks(capId);
	if (taskResult.getSuccess())
		{ taskArr = taskResult.getOutput(); }
	else
		{ logDebug( "**ERROR: getting tasks : " + taskResult.getErrorMessage()); return false }
	
	var isActivecount = 0;
	for (xx in taskArr) {
		if (taskArr[xx].getActiveFlag().equals("Y") && !taskArr[xx].getTaskDescription().equals(wfTask)) {
			logDebug( "active tasks : " + taskArr[xx].getTaskDescription()); isActivecount += 1;
			return false; }
		}
	if (isActivecount == 0) { return true; }
	}