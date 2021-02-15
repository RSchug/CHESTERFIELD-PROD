//17BMP0017
//aa.env.setValue("id1", "REC17");
//aa.env.setValue("id2", "00000");
//aa.env.setValue("id3", "000KX");


var id1 = aa.env.getValue("id1");
var id2 = aa.env.getValue("id2");
var id3 = aa.env.getValue("id3");
var result = aa.cap.getCapID(id1,id2,id3);
var capId = result.getOutput();
aa.print("CapID: " + capId);



aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage", "Got the Cap ID successfully");
aa.env.setValue("capID", result.getOutput().toString());
aa.env.setValue("customID", result.getOutput().getCustomID());
aa.print(result.getOutput().getCustomID());

aa.env.setValue("ADMINCER",getAppSpecific("Admin certified"));
aa.print(getAppSpecific("Admin certified"));

aa.env.setValue("CERTDATE",getAppSpecific("Certified Date"));
aa.print(getAppSpecific("Certified Date"));

aa.env.setValue("TOTALDRNG",getAppSpecific("Total drainage area to BMP in acres"));
aa.print(getAppSpecific("Total drainage area to BMP in acres"));

aa.env.setValue("BMPRECORDID",result.getOutput().getCustomID());  //field 6 20 21
aa.print(result.getOutput().getCustomID());

aa.env.setValue("ID",getAppSpecific("ID"));
aa.print(getAppSpecific("ID"));	

aa.env.setValue("DESC",getAppSpecific("Description"));
aa.print(getAppSpecific("Description"));	

aa.env.setValue("FENCE",getAppSpecific("Fence"));
aa.print(getAppSpecific("Fence"));	

aa.env.setValue("FOREST",getAppSpecific("Forest/open space in acres"));
aa.print(getAppSpecific("Forest/open space in acres"));	

aa.env.setValue("GVALVE",getAppSpecific("Gate valve"));
aa.print(getAppSpecific("Gate valve"));	

aa.env.setValue("IMPREVIOUS",getAppSpecific("Impervious cover in acres"));
aa.print(getAppSpecific("Impervious cover in acres"));	

aa.env.setValue("LATITUDE",getAppSpecific("Latitude"));
aa.print(getAppSpecific("Latitude"));

aa.env.setValue("PHOSPHOROUS",getAppSpecific("Load removed in lbs."));
aa.print(getAppSpecific("Load removed in lbs."));

aa.env.setValue("NITROGEN",getAppSpecific("Nitrogen Removed"));
aa.print(getAppSpecific("Nitrogen Removed"));

aa.env.setValue("LONGITUDE",getAppSpecific("Longitude"));
aa.print(getAppSpecific("Longitude"));

aa.env.setValue("TURF",getAppSpecific("Managed turf in acres"));
aa.print(getAppSpecific("Managed turf in acres"));

aa.env.setValue("MS4",getAppSpecific("Discharges to MS4"));
aa.print(getAppSpecific("Discharges to MS4"));

aa.env.setValue("OWNER",getAppSpecific("Owner"));
aa.print(getAppSpecific("Owner"));

aa.env.setValue("RWATERBODY",getAppSpecific("Water Body"));
aa.print(getAppSpecific("Water Body"));

aa.env.setValue("REMOVAL",getAppSpecific("Design removal efficiency percentage"));
aa.print(getAppSpecific("Design removal efficiency percentage"));

aa.env.setValue("NITREMOVAL",getAppSpecific("Nitrogen design removal percentage"));
aa.print(getAppSpecific("Nitrogen design removal percentage"));

aa.env.setValue("STRUCTURENO",getAppSpecific("Structure number"));
aa.print(getAppSpecific("Structure number"));

aa.env.setValue("VOLUME",getAppSpecific("Volume in cubic feet"));
aa.print(getAppSpecific("Volume in cubic feet"));

//Field 27 28 29 missing

aa.env.setValue("PARTTYPE",getAppSpecific("Part Type"));
aa.print(getAppSpecific("Part Type"));

aa.env.setValue("WATERBODY",getAppSpecific("Water Body"));
aa.print(getAppSpecific("Water Body"));

aa.env.setValue("WATERBODYID",getAppSpecific("Water body ID"));
aa.print(getAppSpecific("Water body ID"));

//misisng field


aa.env.setValue("MANUFACTURED",getAppSpecific("Manufactured"));
aa.print(getAppSpecific("Manufactured"));

aa.env.setValue("TECHTYPE",getAppSpecific("Technology Type"));
aa.print(getAppSpecific("Technology Type"));

aa.env.setValue("TECHDESC",getAppSpecific("Technology Description"));
aa.print(getAppSpecific("Technology Description"));

var parentId =getParent(capId);
aa.print(parentId);

aa.env.setValue("LDID",parentId.getCustomID());
aa.print(parentId.getCustomID());

aa.env.setValue("PROJNAME",getAppSpecific("Project name",parentId));
aa.print(getAppSpecific("Project name",parentId));
//-------------------------------------------------------------------------
function getAppSpecific(itemName)  // optional: itemCap
	{
        
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
    	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
	 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
			{
			for (i in appspecObj)
				if (appspecObj[i].getCheckboxDesc() == itemName)
					{
					return appspecObj[i].getChecklistComment();
					break;
					}
			} // item name blank
		} 
	else
		{ aa.print( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
	}


function getParent() 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(capId,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			aa.print( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		aa.print( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	}
