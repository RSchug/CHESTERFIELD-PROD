function schedulePendingInspection(iType,DateToSched)
{
	var itmResult = aa.inspection.getInspections(capId)
	var itmArray = itmResult.getOutput();
	
	for (thisItm in itmArray)
		{
			var it = itmArray[thisItm];
			if(it.getInspectionType() == iType && it.getInspectionStatus() == "Pending" && it.getScheduledDate() == null)
			{
			it.setScheduledDate(aa.date.parseDate(DateToSched))
			aa.inspection.editInspection(it);
			}
		}
}