try {
    // Set the Reviewers Tasks per the wfStatus choosen per REVIEW DEPTS FOR ELM Spreadsheet scritp# 60p - 09-2020 updated review due dates per ELM Planning Due Date Doc
	if (appMatch('*/*/Variance/*') || appMatch('*/*/SpecialException/*') || appMatch('*/*/AdminVariance/*')) {
		if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
			activateTask("CDOT Review");
			editTaskDueDate('CDOT Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("Environmental Engineering Review");
			editTaskDueDate('Environmental Engineering Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("Fire and Life Safety Review");
			editTaskDueDate('Fire and Life Safety Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("Health Department Review");
			editTaskDueDate('Health Department Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("Planning Review");
			editTaskDueDate('Planning Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("Utilities Review");
			editTaskDueDate('Utilities Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("VDOT Review");
			editTaskDueDate('VDOT Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			activateTask("Real Property Review");
			editTaskDueDate('Real Property Review', dateAdd(getTaskDueDate('Review Distribution'),13));
			deactivateTask("Default");
		}
	}
	
	if ((appMatch('Planning/LandUse/AdminVariance/NA') || appMatch('Planning/LandUse/Variance/NA') || appMatch('Planning/LandUse/SpecialException/NA') || appMatch('Planning/LandUse/Appeal/NA')) &&
		matches(wfTask,'BZA Staff Report') && matches(wfStatus,'Ready for BZA','Complete') && isTaskActive('BZA Hearing')) {
		showMessage = true;
		comment('<font size=small><b>The already Set BZA Hearing Due Date was updated by the workflow process step, Please UPDATE it back to the Scheduled Hearing Date.</b></font>');	
	}
	if ((appMatch('Planning/LandUse/ManufacturedHomes/NA') || appMatch('Planning/LandUse/RPAException/NA')) && matches(wfTask,'Review Consolidation') && matches(wfStatus,'Complete','Review Complete') && isTaskActive('BOS Hearing')) {
		showMessage = true;
		comment('<font size=small><b>The already Set BOS Hearing Due Date was updated by the workflow process step, Please UPDATE it back to the Scheduled Hearing Date.</b></font>');
	}
//6P  moved to WTUA:Planning

//6.1P Not Needed - fixed in workflow

//48P  Not Needed - fixed in workflow

//90P  Not Needed - fixed in workflow
//Add Planning/LandUse/AdminVariance/NA Fee when Application Submittal - Calculate Fees
	if (appMatch("Planning/LandUse/AdminVariance/NA") && (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees')){
		updateFee("VARIANCEADM","CC-PLANNING","FINAL",1,"N");
	}
//Add Planning/LandUse/Variance/NA Fee when Application Submittal - Calculate Fees
	if (appMatch("Planning/LandUse/Variance/NA") && (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees')){
		updateFee("VARIANCEBZA","CC-PLANNING","FINAL",1,"N");
	}
//Add Planning/LandUse/Appeal/NA Fee when Application Submittal - Calculate Fees
	if (appMatch("Planning/LandUse/Appeal/NA") && (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees')){
		updateFee("APPEAL","CC-PLANNING","FINAL",1,"N");
	}
//Add Planning/LandUse/WrittenDetermination/NA Fee when Request Submitted - and NOT Request Not Applicable and FEE is AUTOINVOICED
	if (appMatch("Planning/LandUse/WrittenDetermination/NA") && (wfTask == 'Request Submitted' && wfStatus == 'Calculate Fees')){
		updateFee("WRITTEN","CC-PLANNING","FINAL",1,"Y");
	}
//Add Planning/LandUse/RPAException/NA Fee when Application Submittal - Calculate Fees
	if (appMatch("Planning/LandUse/RPAException/NA") && (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees')){
		updateFee("RPAEXCEPTION","CC-PLANNING","FINAL",1,"N");
	}
//Add the Invoiceall function here for the above records, except for WD - that has other ...
	if ((appMatch("Planning/LandUse/RPAException/NA") || appMatch("Planning/LandUse/Appeal/NA") || appMatch("Planning/LandUse/Variance/NA") || appMatch("Planning/LandUse/AdminVariance/NA")) &&
		(wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment')) {
		invoiceAllFees(capId);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}