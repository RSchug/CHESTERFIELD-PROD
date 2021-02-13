try {
	if (!feeExists("CC-UTL-RM01")){
	addFee("CC-UTL-RM01","CC-UTL-RM","FINAL",1,"Y");
	addFee("CC-UTL-RM02","CC-UTL-RM","FINAL",1,"Y");
	addFee("BACKFLOW","CC-UTL-RM","FINAL",1,"Y");
	addFee("STATELEVY","CC-UTL-RM","FINAL",1,"Y");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}