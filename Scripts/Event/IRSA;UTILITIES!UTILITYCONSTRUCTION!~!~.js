// IRSA: Utilities/UtilityConstruction/*/*
// 14U When 'Daily Status Report' Inspection Type is updated to Status of 'Rejected' reassign Inspector to original Inspector
if (inspType == "Daily Status Report" && matches(inspResult, "Rejected")) {
    var firstInspectorID = getFirstInspector(inspType);
    assignInspection(inspId, firstInspectorID);
    // scheduleInspectDate(inspType, dateAdd(null, 1, true), firstInspectorID, null, "Auto Scheduled"); // Auto Schedule for next working day.
    // scheduleInspection(inspType, 1, firstInspectorID, null, "Auto Scheduled"); // Auto Schedule for next day.
}
