function assignTask_CHESTERFIELD(wfstr, username) {
    // TODO: Update with GIS Info based on record type or user discipline.
    // use inspId is null then it will use inspType & cap info to determine inspector.
    var processName = (arguments.length > 2 && arguments[2] != null ? arguments[2] : "");
    var itemCapId = (arguments.length > 3 && arguments[3] != null ? arguments[3] : capId);
    var userDiscipline = (arguments.length > 4 && arguments[4] != null ? arguments[4] : null);

    if (arguments.length > 3 && arguments[3] != null) {
        var itemCap = aa.cap.getCap(itemCapId).getOutput();
        var capTypeResult = itemCap.getCapType();
        var capTypeString = capTypeResult.toString();
        var appTypeArray = capTypeString.split("/");
    } else {
        var appTypeArray = appTypeString.split("/");
    }

    var userDistrict = null;
    var gisLayerName = null, gisLayerAbbr = null, gisLayerField = null;
    if (typeof (gisMapService) == "undefined") gisMapService = null; // Check for global.
    if (userDiscipline == "Enforcement") {
        userDistrict = AInfo["ParcelAttribute.CouncilDistrict"];
        gisLayerName = "Enforcement Boundaries";
        gisLayerField = "InspectorID";
        logDebug("Using userDiscipline: " + userDiscipline + ", param");
    } else if (userDiscipline == "EnvEngineering") {
        userDistrict = AInfo["ParcelAttribute.InspectionDistrict"];
        gisLayerName = "Parcel";
        gisLayerField = "EE Inspector";
        logDebug("Using userDiscipline: " + userDiscipline + ", param");
    } else {
        var userDiscipline = appTypeArray[0];
        if (appMatch("Enforcement/*/*/*")) {
            logDebug("Using userDiscipline: " + userDiscipline + " appTypeArray[0]");
            userDiscipline = "Enforcement";
            userDistrict = AInfo["ParcelAttribute.CouncilDistrict"];
            gisLayerName = "Enforcement Boundaries";
            gisLayerField = "InspectorID";
            logDebug("Using userDiscipline: " + userDiscipline + ", appType: Enforcement");
        } else if (appMatch("EnvEngineering/*/*/*")) {
            userDiscipline = "EnvEngineering";
            userDistrict = AInfo["ParcelAttribute.InspectionDistrict"];
            gisLayerName = "Parcel";
            gisLayerField = "EE Inspector";
            logDebug("Using userDiscipline: " + userDiscipline + ", appType: EnvEngineering");
        } else {
            logDebug("Using userDiscipline: " + userDiscipline + ", appTypeArray[0]");
        }
    }
    if (username == "") username == null;

    // Use USER_DISTRICTS, userDiscipline & userDistrict to determine inspector.
    if (username == null) {
        if (userDistrict == null) {
            logDebug("Using userDiscipline: " + userDiscipline);
            if (gisMapService != null && gisLayerName != null && gisLayerField != null) { // Auto assign inspector based on GIS
                userDistrict = getGISInfo(gisMapService, gisLayerName, gisLayerField);
            }
        }

        if (typeof (userDistrict) == "undefined") userDistrict = null;
        // Check for inspection discipline & district mapping to inspectors
        username = lookup("USER_DISTRICTS", (userDiscipline ? userDiscipline : "") + (userDistrict ? "-" + userDistrict : ""));
        if (typeof (username) == "undefined" && userDiscipline)
            username = lookup("USER_DISTRICTS", userDiscipline);
        if (typeof (username) == "undefined" && userDistrict)
            username = lookup("USER_DISTRICTS", userDistrict);
        if (typeof (username) == "undefined") username = null;
        if (username == "") username == null;
    }

    // Get User object.
    var userResult = aa.person.getUser(username);
    if (!userResult.getSuccess()) { logDebug("**ERROR: Failed to get user object: " + userResult.getErrorMessage()); return false; }
    var userObj = userResult.getOutput();  //  User Object

    // Assigns the task to a user.  No audit.
    var workflowResult = aa.workflow.getTaskItems(itemCapId, wfstr, processName, null, null, null);
    if (!workflowResult.getSuccess()) { logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); return false; }

    var wfObj = workflowResult.getOutput();
    for (i in wfObj) {
        var fTask = wfObj[i];
        if (processName != "" && !fTask.getProcessCode().equals(processName)) continue;
        if (!fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) continue;
        fTask.setAssignedUser(userObj);
        var taskItem = fTask.getTaskItem();
        var adjustResult = aa.workflow.assignTask(taskItem);

        logDebug("Assigned Workflow Task: " + wfstr + " to "
            + (userObj && userObj.getGaUserID() ? "user: " : "department: ") + username
            + (userObj && userObj.getGaUserID() && userObj.getFullName() ? ", Name: " + userObj.getFullName() : "")
            + (userDiscipline ? ", Discipline: " + userDiscipline : "")
            + (userDistrict ? ", District: " + userDistrict : "")
        );
    }
}
