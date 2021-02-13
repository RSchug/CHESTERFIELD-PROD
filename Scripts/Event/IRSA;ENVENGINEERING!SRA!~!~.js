//Variables for the EE Inspector based on Parcel field "Inspection Dist" and Standard Choice 'InspectionAssignmentEnvEngineering'
var ParcelInspectorEnvEng = AInfo["ParcelAttribute.InspectionDistrict"];
//var InspAssignment = lookup("InspectionAssignmentEnvEngineering",ParcelInspectorEnvEng);
var iInspector = assignInspection_CHESTERFIELD(null); // Get Inspector
var InspAssignment = null;
if (iInspector && iInspector.getGaUserID()) InspAssignment = iInspector.getGaUserID();

//If EE QC Inspection Result is 'Approved' then close Inspections Workflow Task.//
if (inspType.equals("EE QC Inspection") && inspResult.equals("Approved")){
closeTask("Inspections","Approved","Updated based on Approved Inspection Result","");
}
//If Inspection Result is 'Not Approved' then update Inspections Workflow Task.//
if (matches(inspResult,"Not Approved")){
updateTask("Inspections","Not Approved","Updated based on Not Approved Inspection Result","");
}
//If VDOT Inspection Result is 'Approved' then schedule Utilities Inspection for next business day.//
if (inspType.equals("VDOT Inspection") && inspResult.equals("Approved")){
scheduleInspection("Utilities Inspection",1,InspAssignment,null,"Auto Scheduled");
}
//If Utilities Inspection Result is 'Approved' then schedule EE Inspection for next business day.//
if (inspType.equals("Utilities Inspection") && inspResult.equals("Approved")){
scheduleInspection("EE Inspection",1,InspAssignment,null,"Auto Scheduled");
}
//If EE Inspection Result is 'Approved' then schedule EE QC Inspection for next business day.//
if (inspType.equals("EE Inspection") && inspResult.equals("Approved")){
scheduleInspection("EE QC Inspection",1,InspAssignment,null,"Auto Scheduled");
}