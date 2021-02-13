function assignInspection_CHESTERFIELD(inspId) {
    // TODO: Update with GIS Info based on record type or insp type.
    // use inspId is null then it will use inspType & cap info to determine inspector.
    var inspectorId = (arguments.length > 1 && arguments[1] != null ? arguments[1] : null);
    var itemCap = (arguments.length > 2 && arguments[2] != null ? arguments[2] : capId);
    var inspType = (arguments.length > 3 && arguments[3] != null ? arguments[3] : null);

    if (arguments.length > 2 && arguments[2] != null) {
        var cap = aa.cap.getCap(itemCap).getOutput();
        var capTypeResult = cap.getCapType();
        var capTypeString = capTypeResult.toString();
        var appTypeArray = capTypeString.split("/");
    } else {
        var appTypeArray = appTypeString.split("/");
    }

    if (inspId) {
        iObjResult = aa.inspection.getInspection(itemCap, inspId);
        if (!iObjResult.getSuccess()) {
            logDebug("**WARNING retrieving inspection " + inspId + " : " + iObjResult.getErrorMessage());
            return false;
        }
        iObj = iObjResult.getOutput();
        inspType = null;
        if (iObj) {
            inspType = iObj.getInspection().getInspectionType();
        }
    }

    var inspDiscipline = appTypeArray[0], inspDistrict = null;
    var gisLayerName = null, gisLayerAbbr = null, gisLayerField = null;
    if (typeof (gisMapService) == "undefined") gisMapService = null; // Check for global.
    if (appMatch("Enforcement/*/*/*")) {
        inspDiscipline = "Enforcement";
        inspDistrict = AInfo["ParcelAttribute.CouncilDistrict"];
        gisLayerName = "Enforcement Boundaries";
        gisLayerField = "InspectorID";
    } else if (appMatch("EnvEngineering/*/*/*")) {
        inspDiscipline = "EnvEngineering";
        inspDistrict = AInfo["ParcelAttribute.InspectionDistrict"];
        gisLayerName = "Parcel";
        gisLayerField = "EE Inspector";
    }
    if (inspectorId == "") inspectorId == null;

    // Use USER_DISTRICTS, inspDiscipline & inspDistrict to determine inspector.
    if (inspectorId == null) {
        if (inspDistrict == null) {
            if (gisMapService != null && gisLayerName != null && gisLayerField != null) { // Auto assign inspector based on GIS
                inspDistrict = getGISInfo(gisMapService, gisLayerName, gisLayerField);
            }
        }

        if (typeof (inspDistrict) == "undefined") inspDistrict = null;
        if (typeof (inspDiscipline) == "undefined") inspDiscipline = null;
        // Check for inspection discipline & district mapping to inspectors
        inspectorId = lookup("USER_DISTRICTS", (inspDiscipline ? inspDiscipline : "") + (inspDistrict ? "-" + inspDistrict : ""));
        if (typeof (inspectorId) == "undefined" && inspDiscipline)
            inspectorId = lookup("USER_DISTRICTS", inspDiscipline);
        if (typeof (inspectorId) == "undefined" && inspDistrict)
            inspectorId = lookup("USER_DISTRICTS", inspDistrict);
        if (typeof (inspectorId) == "undefined") inspectorId = null;
        if (inspectorId == "") inspectorId == null;
    }

    // Check for valid inspector id.
    var iName = inspectorId;
    var iInspector = getInspectorObj(iName);

    if (!iInspector) {
        logDebug("**WARNING could not find inspector or department: " + iName + ", no assignment was made");
        return false;
    }

    if (inspId) {
        if (inspectorId != null && inspectorId != "" && false) {
            assignInspection(inspId, inspectorId, itemCap);
            logDebug("assigning inspection " + inspId + " to " + inspectorId);
            /* iObj.setInspector(iInspector);
            if (iObj.getScheduledDate() == null) {
                iObj.setScheduledDate(sysDate);
            }
            aa.inspection.editInspection(iObj) */
        } else if (iInspector) { // Department
            logDebug("assigning inspection " + inspId + " to department " + iName);
            iObj.setInspector(iInspector);
            if (iObj.getScheduledDate() == null) {
                iObj.setScheduledDate(sysDate);
            }
            var inspResult = aa.inspection.editInspection(iObj)
            if (inspResult.getSuccess()) {
                logDebug("Successfully assigned inspection: " + inspId
                    + (inspType ? " " + inspType : "") + " to "
                    + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
                    + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
                    + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
                    + (inspDistrict ? ", District: " + inspDistrict : "")
                );
            } else {
                logDebug("ERROR: assigning inspection: " + inspId
                    + (inspType ? " " + inspType : "") + " to "
                    + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
                    + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
                    + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
                    + (inspDistrict ? ", District: " + inspDistrict : "")
                    + ": " + inspResult.getErrorMessage());
            }
        }
    } else {
        logDebug("Found "
            + (iInspector && iInspector.getGaUserID() ? "inspector: " : "department: ") + iName
            + (iInspector && iInspector.getGaUserID() && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
            + (inspDiscipline ? ", Discipline: " + inspDiscipline : "")
            + (inspDistrict ? ", District: " + inspDistrict : "")
        );
    }
    return iInspector;
}
