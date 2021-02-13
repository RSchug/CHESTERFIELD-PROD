// WTUB:Utilities/UtilityConstruction/NA/NA
if (wfTask == 'Utility Construction Release' && wfStatus == 'Release to Construction') {
    //If 'Utility Construction Release' Workflow Task Status is updated to 'Release to Construction' and 
    //'Approved Plans Needed' Custom Field is not 0 or 'Contract Signed Date' is blank, 
    //then display error message 'Approved Plans needed must be 0 or Contract Signed Date is required'
    if (AInfo["Approved Plans Needed"] != 0) {
        showMessage = true;
        comment('<font size=small><b>Approved Plans Needed must be 0</b></font>');
        cancel = true;
    }

    if (AInfo["Contract Signed Date"] == null) {
        showMessage = true;
        comment('<font size=small><b>Contract Signed Date is required</b></font>');
        cancel = true;
    }
    // 9U: If 'Utility Construction Release' Workflow Task Status is updated to 'Release to Construction' and the linked Planning Record does not have an active or completed 'Review Consolidation' Workflow Task,	then display error message 'Plans are not approved on Planning Record'
    // Planning Records just are Planning/*/*/ * as the Module.
    if (parentCapId)
        logDebug("parentCapId: " + parentCapId.getCustomID() + ", appMatch: " + appMatch("Planning/*/*/*", parentCapId) + ", isTaskComplete: " + !isTaskComplete_TPS("Review Consolidation", parentCapId));
    if (parentCapId && appMatch("Planning/*/*/*", parentCapId) && !isTaskComplete_TPS("Review Consolidation", parentCapId)) {
        showMessage = true;
        comment('<font size=small><b>Plans are not approved on Planning Record ' + parentCapId.getCustomID() + '</b></font>');
        cancel = true;
    }
}
