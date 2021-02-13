function createCap_TPS() {
    /*  Creates the new application and returns the capID object
    | Modified from INCLUDES_ACCELA_FUNCTIONS
    | newAppTypeString - new Application Type string. Default is Current Group/Type/SubType/"License"
    | newCapName - new Cap Name. Default is "". For new license typically use capName.
    | newCapIdString - new Cap ID. Default is null (Next Sequence #). For new License typically use capIDString.substr(0, (capIDString.length - 1)) + 'L';
    | newCapRelation - new Cap is Child, Parent or not related to source Cap. Default is none. For new license typically use "Parent".
    | srcCapId - source Cap Id. Default is capId. For new license typically use null (default).
    | copySections - Array of sections of data to copy from source Cap. Default is null. For new license typically use null (default). Use empty array [] if you do not want to copy data. By default not all sections are copied only most commonly used ones.
    | initStatus - initial new record status. Default is null (Configuration Default). For new license typically use "Active"
    | scheduledDate - record scheduled date. Default is null (not set). For new License use sysDateMMDDYYYY (today)
    | firstIssuedDate - First issue date. Default is null (not set). For new License use sysDateMMDDYYYY (today)
    
    ***** Uses copyCapInfo, editAppName, editScheduledDate, editFirstIssuedDate.
    */
    var newCap = null;
    var newCapId = null;
    try {
        var newAppTypeString = (arguments.length > 0 && arguments[0] ? arguments[0] : srcAppTypeArray[0] + "/" + srcAppTypeArray[1] + "/" + srcAppTypeArray[2] + "/" + "License");
        var newCapName = (arguments.length > 1 && arguments[1] ? arguments[1] : "");
        // Typically use capName
        var newCapIdString = (arguments.length > 2 && arguments[2] ? arguments[2] : null);
        // For new License typically use capIDString.substr(0, (capIDString.length - 1)) + 'L';
        var newCapRelation = (arguments.length > 3 && arguments[3] && exists(arguments[3], ["Child", "Parent"]) ? arguments[3] : null);
        var srcCapId = (arguments.length > 4 && arguments[4] ? arguments[4] : capId);
        var copySections = (arguments.length > 5 && arguments[5] ? arguments[5] : null);
        // For new License typically use null, by default education is not copied.
        var initStatus = (arguments.length > 6 && arguments[6] ? arguments[6] : null);
        // For new License typically use "Active"
        var scheduledDate = (arguments.length > 7 && arguments[7] ? arguments[7] : null);
        // For new License use sysDateMMDDYYYY
        var firstIssuedDate = (arguments.length > 8 && arguments[8] ? arguments[8] : null);
        // For new License use sysDateMMDDYYYY
        if (copySections == null) copySections = ["Addresses", "ASI", "ASIT", "Cap Name", "Cap Short Notes", "Conditions", "Contacts", "GIS Objects", "LPs", "Owners", "Parcels"]; // Excludes Additional Info, Cap Detail, Conditions, Comments, Detailed Description, Documents, Education, ContEducation, Examination

        var srcCapModel = null,
            srcCapName = null,
            srcAppTypeAlias = null,
            srcAppTypeString = null,
            srcAppTypeArray = null;
        var s_result = aa.cap.getCap(srcCapId);
        if (s_result.getSuccess()) {
            var srcCap = s_result.getOutput();
            var srcCapModel = s_result.getOutput().getCapModel()
            var srcCapName = srcCap.getSpecialText();
            var srcAppTypeResult = srcCap.getCapType();
            var srcAppTypeAlias = srcAppTypeResult.getAlias();
            var srcAppTypeString = srcAppTypeResult.toString();
            var srcAppTypeArray = srcAppTypeString.split("/");
        } else {
            logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage());
        }


        // create new record
        var newAppTypeArray = newAppTypeString.split("/");
        if (newAppTypeArray.length != 4) {
            logDebug("**ERROR creating CAP.  Application Type String is incorrectly formatted: " + newAppTypeArray);
            return false;
        }
        var appCreateResult = aa.cap.createApp(newAppTypeArray[0], newAppTypeArray[1], newAppTypeArray[2], newAppTypeArray[3], newCapName);
        if (!appCreateResult.getSuccess()) {
            logDebug("**ERROR: creating " + newAppTypeString + " CAP: " + appCreateResult.getErrorMessage());
            return false;
        }

        var newCapId = appCreateResult.getOutput();
        logDebug("Successfully created " + newAppTypeString + " CAP " + newCapId.getCustomID() + " (" + newCapId + ")");
        var newCapObj = aa.cap.getCap(newCapId).getOutput();	//Cap object

        // create Detail Record
        newCapModel = aa.cap.newCapScriptModel().getOutput();
        newCapDetailModel = newCapModel.getCapModel().getCapDetailModel();
        newCapDetailModel.setCapID(newCapId);
        aa.cap.createCapDetail(newCapDetailModel);

        if (newCapIdString) {   // Update Record ID
            var s_capResult = aa.cap.updateCapAltID(newCapId, newCapIdString);
            if (!s_capResult.getSuccess() || !s_capResult.getOutput())
                logDebug("ERROR: updating Cap ID " + newCapId.getCustomID() + " to " + newCapIdString + ": " + s_capResult.getErrorMessage());
            // get newCapId object with updated capId.
            var s_capResult = aa.cap.getCapID(newCapId.getID1(), newCapId.getID2(), newCapId.getID3());
            if (!s_capResult.getSuccess() || !s_capResult.getOutput())
                logDebug("ERROR: getting Cap ID " + newCapIdString + " " + newCapId + ": " + s_capResult.getErrorMessage());
            else
                newCapId = s_capResult.getOutput();
            newCapIdString = newCapId.getCustomID();
        } else {
            newCapIdString = newCapId.getCustomID();
        }

        var statusComment = "";
        if (srcCapId) {
            if (newCapRelation) {   // Cap Relationship?
                if (newCapRelation == "Child") {
                    var result = aa.cap.createAppHierarchy(srcCapId, newCapId);
                } else {
                    var result = aa.cap.createAppHierarchy(newCapId, srcCapId);
                }
                if (result.getSuccess())
                    logDebug(newCapRelation + " CAP " + newAppTypeString + " successfully linked");
                else
                    logDebug("Could not link " + newCapRelation.toLowerCase() + " CAP " + newAppTypeString);
            }
            copyCapInfo(srcCapId, newCapId, copySections);  //copy data
            var statusComment = "Created from " + srcAppTypeArray[3] + ": " + srcCapId;
            var statusComment = "Created from " + srcAppTypeAlias + ": " + srcCapId;
        }
        if (newCapName && newCapName != "") {
            logDebug("newCapName: " + newCapName);
            editAppName(newCapName, newCapId);
        }

        if (initStatus)
            updateAppStatus(initStatus, statusComment, newCapId);

        //field repurposed to represent the current term effective date
        if (typeof (editScheduledDate) == "function" && scheduledDate) {
            editScheduledDate(scheduledDate, newCapId);
        }

        //field repurposed to represent the original effective date
        if (typeof (editFirstIssuedDate) == "function" && firstIssuedDate) {
            editFirstIssuedDate(firstIssuedDate, newCapId);
        }

        return newCapId;
    } catch (err) {
        logDebug("A JavaScript Error occurred: " + err.message + " Line " + err.lineNumber);
        return false;
    }
}
