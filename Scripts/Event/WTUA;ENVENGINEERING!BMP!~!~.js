//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
//var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
//var InspAssignment = lookup("InspectionAssignmentEnvEngineering",ParcelInspectorEnvEng);
//var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
//var InspAssignment = null;
//if (iInspector && iInspector.getGaUserID()) InspAssignment = iInspector.getGaUserID();

if (wfTask == 'BMP Certification' && (matches(wfStatus, "Received"))) {
    scheduleInspection("BMP", 30, null, null, "Auto Scheduled");
}

