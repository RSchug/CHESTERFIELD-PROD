try {
// If setting the License status manually from the workflow
	if (wfTask == 'Annual Status' && wfStatus == 'About to Expire') {
		lic = new licenseObject(capIDString);
		lic.setStatus('About to Expire');
	}
//Created Licensed professional after Application Submittal
if ((wfTask == "Application Submittal" && (wfStatus == "Accepted - Plan Review Required" || wfStatus == "Accepted - Plan Review Not Required" || wfStatus == "Accepted")) && checkCapForLicensedProfessionalType("Contractor")){
	createRefLicProfFromLicProfTRU();
}
//Adhoc task updated to Revision then activate 'Review Distribution' and status of 'Corrections Received'
	if (wfTask =='Document Submitted Online' && wfStatus == 'Revision'){
		if (isTaskActive('Review Distribution')){
			updateTask("Review Distribution", "Corrections Received", "Updated based on Document Submitted Online 'Revision' Status", "");
			updateAppStatus("In Review","Updated based on Document Submitted Online 'Revision' Status.");
		}
	}
//For DigEplan
	if (matches(wfTask,'Review Distribution','Review Consolidation')) {
		loadCustomScript("WTUA_EXECUTE_DIGEPLAN_SCRIPTS_BUILD");
	}
//For PROFFER
	if (wfTask == 'Review Distribution' && wfStatus == 'Routed for Review') {
		if(appMatch("Building/Permit/Commercial/NA") && AInfo["Nature of Work"] == "New Construction" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			addAdHocTask("ADHOC_WF","Budget and Management Review","");
		}
		if((appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family")) && AInfo["Nature of Work"] == "New Construction of Single Family Dwelling" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
			addAdHocTask("ADHOC_WF","Budget and Management Review","");
		}
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}