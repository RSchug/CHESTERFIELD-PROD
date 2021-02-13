//IMSA:ENVENGINEERING/LAND DISTURBANCE/*/*
//When Pre-Construction Meeting is scheduled update Workflow Task as Scheduled.
if(matches(inspType,"Pre-Construction Meeting")){
updateTask("Land Disturbance Permit","PreCon Scheduled","Updated based on Scheduled Inspection","");
}