// 14U When 'Daily Status Report' Inspection Type is updated to Status of 'Rejected' reassign Inspector to original Inspector
    var firstInspectorID = getFirstInspector(inspType);
    var ProjectComplete = inspObj.getInspection().getActivity().getOvertime();
if (inspType == "Daily Status Report" && matches(inspResult, "Rejected")) {
    assignInspection(inspId, firstInspectorID);
}
//Add another Daily Status Report when Project Complete is not Y
if (inspType == "Daily Status Report" && matches(inspResult, "Complete","Approved") && (ProjectComplete != "Y")) {
	var inspcomment = getLastInspectioncomment(inspType);
    scheduleInspection("Daily Status Report",1,firstInspectorID, null,inspcomment);
}