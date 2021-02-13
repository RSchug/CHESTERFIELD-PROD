function getFirstInspector(insp2Check) { 
    // function getLastInspector: returns the inspector ID (string) of the first inspector to result the inspection.
    //
    var inspUserID = null;
    var inspResultObj = aa.inspection.getInspections(capId);
    if (inspResultObj.getSuccess()) {
        inspList = inspResultObj.getOutput();

        inspList.sort(compareInspResultDateDesc)
        for (xx in inspList)
            if (String(insp2Check).equals(inspList[xx].getInspectionType()) && !inspList[xx].getInspectionStatus().equals("Scheduled")) {
                // have to re-grab the user since the id won't show up in this object.
                inspUserObj = aa.person.getUser(inspList[xx].getInspector().getFirstName(), inspList[xx].getInspector().getMiddleName(), inspList[xx].getInspector().getLastName()).getOutput();
                inspUserID = inspUserObj.getUserID();
                logDebug((inspList[xx].getInspection().getActivity().getCompletionDate() ? new Date(inspList[xx].getInspection().getActivity().getCompletionDate().getTime()) : inspList[xx].getInspection().getActivity().getCompletionDate()) + " "
                    + (inspList[xx].getInspectionStatusDate() ? new Date(inspList[xx].getInspectionStatusDate().getEpochMilliseconds()) : inspList[xx].getInspectionStatusDate())
                    + " " + inspUserID);
            }
        return inspUserID;
    }
    return null;
}

function compareInspResultDateDesc(a, b) {
    if (a.getInspection().getActivity().getCompletionDate() == b.getInspection().getActivity().getCompletionDate()) {
        if (a.getInspectionStatusDate() == null && b.getInspectionStatusDate() == null) {
            return false;
        }
        if (a.getInspectionStatusDate() == null && b.getInspectionStatusDate() != null) {
            return true;
        }
        if (a.getInspectionStatusDate() != null && b.getInspectionStatusDate() == null) {
            return false;
        }
        return (a.getInspectionStatusDate().getEpochMilliseconds() < b.getInspectionStatusDate().getEpochMilliseconds());
    }
    if (a.getInspection().getActivity().getCompletionDate() == null && b.getInspection().getActivity().getCompletionDate() != null) {
        return true;
    }
    if (a.getInspection().getActivity().getCompletionDate() != null && b.getInspection().getActivity().getCompletionDate() == null) {
        return false;
    }
    return (a.getInspection().getActivity().getCompletionDate().getTime() < b.getInspection().getActivity().getCompletionDate().getTime());
} 
