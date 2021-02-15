var debug = "";								// Debug String
var br = "<BR>";
//REC17-00000-000CF
//aa.env.setValue("id1", "REC17");
//aa.env.setValue("id2", "00000");
//aa.env.setValue("id3", "000CF");


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
aa.env.setValue("FIRSTNAME", getContactValues("FIRSTNAME"));
aa.print(getContactValues("FIRSTNAME"));
aa.env.setValue("MIDDLENAME", getContactValues("MIDDLENAME"));
aa.print(getContactValues("MIDDLENAME"));
aa.env.setValue("LASTNAME", getContactValues("LASTNAME"));
aa.print(getContactValues("LASTNAME"));
aa.env.setValue("PHONE", getContactValues("PHONE"));
aa.print(getContactValues("PHONE"));
aa.env.setValue("EMAIL", getContactValues("EMAIL"));
aa.print(getContactValues("EMAIL"));
aa.env.setValue("STREETNO", getCapAddress("STREETNO"));
aa.print(getCapAddress("STREETNO"));
aa.env.setValue("DIR", getCapAddress("DIR"));
aa.print(getCapAddress("DIR"));
aa.env.setValue("STREETNAME", getCapAddress("STREETNAME"));
aa.print(getCapAddress("STREETNAME"));
aa.env.setValue("STREETTYPE", getCapAddress("STREETTYPE"));
aa.print(getCapAddress("STREETTYPE"));
aa.env.setValue("SUFFDIR", getCapAddress("SUFFDIR"));
aa.print(getCapAddress("SUFFDIR"));
aa.env.setValue("UNIT", getCapAddress("UNIT"));
aa.print(getCapAddress("UNIT"));
aa.env.setValue("COMPDESC",getAppSpecific("Complaint Description"));
aa.print(getAppSpecific("Complaint Description"));
function getContactValues(strItem)
	{
	var pContactType="Complainant";
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
	{
		var capContactArray = capContactResult.getOutput();
	}

	if (capContactArray)
		{
		for (yy in capContactArray)
			{
			 // debugObject(capContactArray[yy]);
			 if (pContactType.equals(capContactArray[yy].getPeople().getContactType())) 
			 {
				if(strItem.toUpperCase()=="FIRSTNAME")
				{
					return capContactArray[yy].getPeople().firstName;
				}
				else if(strItem.toUpperCase()=="MIDDLENAME")
				{
					return capContactArray[yy].getPeople().middleName;
				}
				else if(strItem.toUpperCase()=="LASTNAME")
				{
					return capContactArray[yy].getPeople().lastName;
				}
				else if(strItem.toUpperCase()=="PHONE")
				{
					return capContactArray[yy].getPeople().phone2;
				}
				else if(strItem.toUpperCase()=="EMAIL")
				{
					return capContactArray[yy].getPeople().email;
				}
			  }
			}
		}
}

function getCapAddress(strItem)
{
                var capContactResult = aa.address.getAddressByCapId(capId);
                if (capContactResult.getSuccess())
                {
                                var capContactArray = capContactResult.getOutput();
                }

                if (capContactArray)
                {
                                for (yy in capContactArray)
                                                                                             
                                {
                                            // debugObject(capContactArray[yy]);  
                                                
                                                if(strItem.toUpperCase()=="STREETNO")
                                                {
                                                              return capContactArray[yy].getHouseNumberStart();
                                                }
                                                else if(strItem.toUpperCase()=="DIR")
                                                {
                                                                return capContactArray[yy].getStreetDirection();
                                                }
                                                else if(strItem.toUpperCase()=="STREETNAME")
                                                {
                                                                return capContactArray[yy].getStreetName();
                                                }
                                                else if(strItem.toUpperCase()=="STREETTYPE")
                                                {
                                                                return capContactArray[yy].getStreetSuffix();
                                                }
            
                                                 else if(strItem.toUpperCase()=="SUFFDIR")
                                                {
                                                                return capContactArray[yy].getStreetSuffixdirection();
                                                }

                                                   else if(strItem.toUpperCase()=="UNIT")
                                                {
                                                                return capContactArray[yy].getUnitStart();
                                                }

                                        
                                }
                }
}

	
function debugObject(object) {
    var output = 'Methods:' + br;
    for (property in object) {
        if (typeof (object[property]) == "function")
            output += "" + property + " " + ': ' + "" + object[property] + "" + br;
    }
    output += "" + br;
    output += "Properties:" + br;

    for (property in object) {
        if (typeof (object[property]) != "function")
            output += "" + property + " " + ': ' + "" + object[property] + "" + br;
    }

    aa.print(output);
}

function getType(obj) {
	if (obj === null)
		return "[object Null]";
	// special case
	//if(obj instanceof javaobject) return obj.getClass();
	return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
} 
function formatDate(date)
{
	if(date == null)
	{
		return "";
	}
	return aa.util.formatDate(date, "MM/dd/yyyy, hh:mm:ss");
}
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