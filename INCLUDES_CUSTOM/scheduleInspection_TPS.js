function scheduleInspection_TPS(inspType) {
    // optional inspector ID.  This function requires dateAdd function
    // DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
    // DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
    // 07/10/2020 RS: Modified from INCLUDES_ACCELA_FUNCTION to also identify inspector
    // RS - added Optional 6th parameter itemCap, cap to schedule inspection for
    // RS - added Optional 7th parameter useWorking, make sure it is on a working day
    // RS - added return scheduled Inspection ID.
    var DaysAhead = (arguments.length > 1 && arguments[1] != null ? arguments[1] : 1);
    var inspectorId = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
    var inspTime = (arguments.length > 3 && arguments[3] ? arguments[3] : null);
    var inspComm = (arguments.length > 4 && arguments[4] ? arguments[4] : "Scheduled via Script");
    var itemCap = (arguments.length > 5 && arguments[5] ? arguments[5] : capId);
    var useWorking = (arguments.length > 6 && arguments[6] == true ? true : false);

    // Determine inspectorId & get inspectorObj.
    var iInspector = null;
    if (inspectorId) {
        var iInspector = getInspectorObj(inspectorId);
    }

    if (useWorking) {
        inspDate = dateAdd(null, DaysAhead, true);
        logDebug("inspDate: " + inspDate);
        //scheduleInspectDate(inspType, inspDate, inspectorId, inspTime, inspComm);
        var schedRes = aa.inspection.scheduleInspection(itemCap, iInspector, aa.date.parseDate(inspDate), inspTime, inspType, inspComm);
    } else {
        inspDate = dateAdd(null, DaysAhead);
        //scheduleInspection(inspType, DaysAhead, inspectorId, inspTime, inspComm);
        var schedRes = aa.inspection.scheduleInspection(itemCap, iInspector, aa.date.parseDate(dateAdd(null, DaysAhead)), inspTime, inspType, inspComm);
    }

    var inspId = null;
    if (schedRes.getSuccess()) {
        inspId = schedRes.getOutput();
        logDebug("Successfully scheduled inspection: " + inspType
            + " in " + DaysAhead + " days" + " on " + inspDate
            + (useWorking ? " (working)" : "")
            + (iInspector && iInspector.getGaUserID() ? " to inspector: " : (inspectorId ? " to department: " : ""))
            + (iInspector && iInspector.getFullName() ? iInspector.getFullName() : "")
            + (iInspector && iInspector.getGaUserID() ? ", UserID: " + iInspector.getGaUserID() : "")
            + (inspTime ? ", time: " + inspTime : "")
            + (inspComm ? ", comment: " + inspComm : "")
            + (schedRes ? ", output: " + schedRes.getOutput() : "")
        );
    } else {
        logDebug("**ERROR: scheduling inspection: " + inspType
            + " in " + DaysAhead + " days" + " on " + inspDate
            + (useWorking ? " (working)" : "")
            + (iInspector && iInspector.getGaUserID() ? " to inspector: " : (inspectorId ? " to department: " : ""))
            + (iInspector && iInspector.getFullName() ? iInspector.getFullName() : "")
            + (iInspector && iInspector.getGaUserID() ? ", UserID: " + iInspector.getGaUserID() : "")
            + (inspTime ? ", time: " + inspTime : "")
            + (inspComm ? ", comment: " + inspComm : "")
            + ": " + schedRes.getErrorMessage());
    }
    return inspId;
}
