function getInspectorObj(inspectorId) {
    // Get inspectorObj based on valid inspector (UserID or Department).
    var iName = inspectorId;
    var iInspector = null;
    if (iName) {
        var iNameResult = aa.person.getUser(iName);
        if (iNameResult.getOutput()) {
            iInspector = iNameResult.getOutput();
        } else { // Check for department name
            inspectorId = null;
            var dpt = aa.people.getDepartmentList(null).getOutput();
            for (var thisdpt in dpt) {
                var m = dpt[thisdpt]
                if (iName.equals(m.getDeptName())) {
                    iNameResult = aa.person.getUser(null, null, null, null, m.getAgencyCode(), m.getBureauCode(), m.getDivisionCode(), m.getSectionCode(), m.getGroupCode(), m.getOfficeCode());
                    if (!iNameResult.getSuccess()) {
                        logDebug("**WARNING retrieving department user model " + iName + " : " + iNameResult.getErrorMessage());
                        return false;
                    }
                    iInspector = iNameResult.getOutput();
                }
            }
        }
    }
    if (iInspector && iInspector.getGaUserID() == null) { // Set FullName to Dept Name
        iInspector.setFullName(iName);
    }
/*
    logDebug("iInspector: " + iInspector 
        + (iInspector && iInspector.getFullName() ? ", Name: " + iInspector.getFullName() : "")
        + (iInspector && iInspector.getGaUserID() ? ", UserID: " + iInspector.getGaUserID() : "")
        + (iInspector && iInspector.isInspector? ", (Inspector)":"")
        );
*/
    return iInspector;
}
