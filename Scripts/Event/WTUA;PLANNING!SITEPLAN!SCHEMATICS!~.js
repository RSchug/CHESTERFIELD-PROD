//FEE
try {
	if (wfTask == 'First Glance Consolidation' && wfStatus == 'Calculate Fees') {
		updateFee("SCHEMATIC","CC-PLANNING","FINAL",1,"N");
	}
	if (wfTask == 'First Glance Consolidation' && wfStatus == 'First Glance Review Complete') {
		invoiceAllFees(capId);
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}