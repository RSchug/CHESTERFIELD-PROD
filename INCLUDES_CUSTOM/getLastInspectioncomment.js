function getLastInspectioncomment(insp2Check)
	// function getLastInspector: returns the inspector ID (string) of the last inspector to result the inspection.
	//
	{
	var	inspUserObj = "No Comments";
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		inspList = inspResultObj.getOutput();
		
		inspList.sort(compareInspDateDesc)
		for (xx in inspList)
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && !inspList[xx].getInspectionStatus().equals("Scheduled"))
				{
				// have to re-grab the user since the id won't show up in this object.
				inspUserObj = inspList[xx].getInspection().resultComment;
				}
		}
	return inspUserObj;
	}
