comment("Get the Inspection Count for this type");
var inspResult = aa.inspection.getInspection(capId, inspId);
inspObj = inspResult.getOutput();
inspObj.setTimeTotal(Number(getinsptypecount(capId, inspType)));
var result = aa.inspection.editInspection(inspObj);
//
//if (getLastInspectioncomment(inspType) != "No Comments") {  //removed on Feb 8 2021 to not populate previous inspection comments into the inspection request comment//
//	var reqcomment = getInspectionComment(capId, inspId);
//	if (reqcomment != "No Comment" && reqcomment != null) {
//		inspcomment = reqcomment + " Last Result: " + getLastInspectioncomment(inspType);
//		editInspectionComment(capId, inspId, inspcomment);
//	}
//	else {
//		editInspectionComment(capId, inspId, getLastInspectioncomment(inspType));
//	}
//}
//
//For PROFFERs Commercial//
if (inspType == "Building Final" ){
		if(appMatch("Building/Permit/Commercial/NA") && AInfo["Nature of Work"] == "New Construction" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
createPendingInspection("CC-BLD-COMM","Budget and Management Final");
schedulePendingInspection("Budget and Management Final",inspSchedDate)	
var address = aa.address.getAddressByCapId(capId).getOutput();
var fileNames = [];
var emailParameters; 
emailParameters = aa.util.newHashtable();
emailParameters.put("$$RecordID$$", capIDString); 
emailParameters.put("$$fileDate$$", fileDate);
emailParameters.put("$$InspectionDate$$", inspSchedDate); 
emailParameters.put("$$RecordStatus$$", capStatus);
emailParameters.put("$$ProjectName$$", capName);
emailParameters.put("$$AddressLine$$", address[0]);
sendNotification("noreply@chesterfield.gov","budgetproffers@chesterfield.gov","mbouquin@truepointsolutions.com","BUDGET_INSPECTION",emailParameters,fileNames);
}
}
//For PROFFERs Residential Multi-Family//
if (inspType == "Building Final" ){
		if((appMatch("Building/Permit/Residential/NA") || appMatch("Building/Permit/Residential/Multi-Family")) && AInfo["Nature of Work"] == "New Construction of Single Family Dwelling" && (parcelHasCondition_TPS("Budget","Applied") || parcelHasCondition_TPS("Budget","Applied(Applied)"))) {
createPendingInspection("CC-BLD-COMM","Budget and Management Final");
schedulePendingInspection("Budget and Management Final",inspSchedDate)	
var address = aa.address.getAddressByCapId(capId).getOutput();
var fileNames = [];
var emailParameters; 
emailParameters = aa.util.newHashtable();
emailParameters.put("$$RecordID$$", capIDString); 
emailParameters.put("$$fileDate$$", fileDate);
emailParameters.put("$$InspectionDate$$", inspSchedDate); 
emailParameters.put("$$RecordStatus$$", capStatus);
emailParameters.put("$$ProjectName$$", capName);
emailParameters.put("$$AddressLine$$", address[0]);
sendNotification("noreply@chesterfield.gov","budgetproffers@chesterfield.gov","mbouquin@truepointsolutions.com","BUDGET_INSPECTION",emailParameters,fileNames);
}
}