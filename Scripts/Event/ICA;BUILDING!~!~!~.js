try {
    showDebug = true;
    for (var insp in inspList) {
        inspId = inspList[insp].getActivity().getIdNumber();
        capId = inspList[insp].getCapID();

        var inspResult = aa.inspection.getInspection(capId, inspId);
        inspObj = inspResult.getOutput();
        var test = Number("0");
        inspObj.setTimeTotal(test);
        var result = aa.inspection.editInspection(inspObj);
    }
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}