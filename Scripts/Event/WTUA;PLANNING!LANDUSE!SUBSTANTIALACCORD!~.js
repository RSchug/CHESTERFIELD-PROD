try {
	//Fees for Substantial Accord
if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees' && AInfo['Request type'] == 'Communication Tower') {
		updateFee("SACTOWER","CC-PLANNING","FINAL",1,"N");
	}
	if (wfTask == 'Application Submittal' && wfStatus == 'Calculate Fees' && AInfo['Request type'] != 'Communication Tower'){
		updateFee("SAOTHER","CC-PLANNING","FINAL",1,"N");
	}
	if (wfTask == 'Application Submittal' && wfStatus == 'Ready for Payment') {
		invoiceAllFees(capId);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}