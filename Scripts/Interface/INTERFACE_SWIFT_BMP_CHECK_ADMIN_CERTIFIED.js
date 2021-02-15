//17BMP0017
//aa.env.setValue("id1", "REC17");
//aa.env.setValue("id2", "00000");
//aa.env.setValue("id3", "000E0");


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