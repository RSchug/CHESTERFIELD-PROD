//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
//var InspAssignment = lookup("InspectionAssignmentEnvEngineering",ParcelInspectorEnvEng);
var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
var InspAssignment = null;
if (iInspector && iInspector.getGaUserID()) InspAssignment = iInspector.getGaUserID();
//If Inspection Result is 'Not Approved' or "Rain Not Approved" and not an VSMP then create an ESC Notice to Comply child record AND schedule a Follow-up inspection on the ESC Notice to Comply child record with a scheduled date 7 days from system date.
if (inspType == 'Initial' && inspResult == 'Not Approved') {
	scheduleInspection("Follow-up",7,InspAssignment,null,"Auto Scheduled");
}
if (inspType == 'Follow-up' && inspResult == 'Not Approved') {
	scheduleInspection("Follow-up",7,InspAssignment,null,"Auto Scheduled");
}