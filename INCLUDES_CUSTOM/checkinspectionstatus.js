function checkinspectionstatus(iType,status)
{
	var check = "false";
	
	var itmResult = aa.inspection.getInspections(capId)
	var itmArray = itmResult.getOutput();
	
	for (thisItm in itmArray)
		{
			var it = itmArray[thisItm];
			if(it.getInspectionType() == iType && it.getInspectionStatus() == status)
			{
			check = "true";
            return check
			}
		}
	
	return check
}