var ParcelInspectorArea = AInfo["ParcelAttribute.INSPECTOR AREA"];
var InspAssignment = lookup("Inspection Assignment - Land Distrubance",ParcelInspectorArea);

if(matches(inspResult,"Undisturbed","Perimeter Control")) 
	{scheduleInspection("E and SC Inspection",14,InspAssignment,null,"Auto Scheduled");
	}

if(inspResult.equals("Field inspection Not Approved"))
{createChild("Enforcement","ErosionandSedimentControl","NA","NA","");}