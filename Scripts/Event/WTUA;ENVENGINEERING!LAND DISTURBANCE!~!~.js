//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
//var InspAssignment = lookup("InspectionAssignmentEnvEngineering", ParcelInspectorEnvEng);
var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
var InspAssignment = null;
if (iInspector && iInspector.getGaUserID())
    InspAssignment = iInspector.getGaUserID();

if (wfTask == 'Land Disturbance Permit' && (matches(wfStatus, "Issued"))) {
    scheduleInspection("Undisturbed", 0, InspAssignment, null, "Auto Scheduled");
}

if (wfTask == 'EE Review' && (matches(wfStatus, "Approved", "Approved with Conditions"))) {
    updateTask("Land Disturbance Permit", "Pending PreCon", "Updated based on EE Review Approved or Approved with Conditions", "");
}
