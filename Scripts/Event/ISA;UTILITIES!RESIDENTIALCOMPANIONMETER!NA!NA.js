try {
	comment("Test form ISA");
	comment("Get the Inspection Count for this type");
	var inspResult = aa.inspection.getInspection(capId, inspId);
	inspObj = inspResult.getOutput();
	inspObj.setTimeTotal(Number(getinsptypecount(capId, inspType)));
	var result = aa.inspection.editInspection(inspObj);

	if (getLastInspectioncomment(inspType) != "No Comments") {
		var reqcomment = getInspectionComment(capId, inspId);
		if (reqcomment != "No Comment" && reqcomment != null) {
			inspcomment = reqcomment + " Last Result: " + getLastInspectioncomment(inspType);
			editInspectionComment(capId, inspId, inspcomment);
		}
		else {
			editInspectionComment(capId, inspId, getLastInspectioncomment(inspType));
		}
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}