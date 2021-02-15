//REC17-00000-000KT --2017UC0011  --0000I  //ASI --CC-UT-UC 
//aa.env.setValue("id1", "REC17");
//aa.env.setValue("id2", "00000");
//aa.env.setValue("id3", "000KT");


//calling Include Scripts
var SCRIPT_VERSION = 3.0;
var useAppSpecificGroupName = true;
var useTaskSpecificGroupName = true;		

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));

var debug = "";								// Debug String
var br = "<BR>";

var id1 = aa.env.getValue("id1");
var id2 = aa.env.getValue("id2");
var id3 = aa.env.getValue("id3");
var result = aa.cap.getCapID(id1,id2,id3);
var capId = result.getOutput();
var cap = aa.cap.getCap(capId).getOutput();	
aa.print("CapID: " + capId);

var AInfo = new Array();	
loadAppSpecific(AInfo); 
logGlobals(AInfo);

var Aparcel = new Array();
loadParcelAttributes(Aparcel);
var lot =Aparcel['ParcelAttribute.Lot'];
var mapref =Aparcel['ParcelAttribute.MAP REF'];
var sub =Aparcel['ParcelAttribute.Subdivision'];
//debugObject(Aparcel);

aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage", "Got the Cap ID successfully");
aa.env.setValue("capID", result.getOutput().toString());
aa.env.setValue("customID", result.getOutput().getCustomID());
aa.print(result.getOutput().getCustomID());

aa.env.setValue("SERVICENO",getAppSpecific("Service Number"));
aa.print(getAppSpecific("Service Number"));

aa.env.setValue("STREETNO",getCapAddress("STREETNO"));
aa.print(getCapAddress("STREETNO"));

aa.env.setValue("DIR",getCapAddress("DIR"));
aa.print(getCapAddress("DIR"));

aa.env.setValue("STREETNAME",getCapAddress("STREETNAME"));  //field 6 20 21
aa.print(getCapAddress("STREETNAME"));

aa.env.setValue("STREETTYPE",getCapAddress("STREETTYPE"));
aa.print(getCapAddress("STREETTYPE"));	

//field 6 keep it blank 

aa.env.setValue("CITY",getCapAddress("CITY"));
aa.print(getCapAddress("CITY"));	

aa.env.setValue("STATE",getCapAddress("STATE"));
aa.print(getCapAddress("STATE"));	

aa.env.setValue("ZIP",getCapAddress("ZIP"));
aa.print(getCapAddress("ZIP"));	

aa.env.setValue("MAPGRID",mapref);
aa.print(mapref);	

aa.env.setValue("SUBDIVISION",sub);
aa.print(sub);	

aa.env.setValue("LOT",lot);
aa.print(lot);

//this for Field 13 
var newws = AInfo["Water Service"];
aa.print(newws);
var newss =AInfo["Sewer Service"];

if(newws == "CHECKED" || newss =="CHECKED")
{
   aa.env.setValue("NEWSERVICE","N");
}
else
{
   aa.env.setValue("NEWSERVICE","E");
}
//end field 13 info

aa.env.setValue("ACTUALMS",String(AInfo['Actual size']));
aa.print(String(AInfo['Actual size']));

aa.env.setValue("VIRSIZE",String(AInfo['Virtual Size']));
aa.print(String(AInfo['Virtual Size']));

aa.env.setValue("SERVICE",AInfo['Service line size']);
aa.print(AInfo['Service line size']);

aa.env.setValue("WATERNO",AInfo['Water Project Number']);
aa.print(AInfo['Water Project Number']);

aa.env.setValue("SEWERNO",AInfo['Sewer Project Number']);
aa.print(AInfo['Sewer Project Number']);

var res = AInfo['Residential Companion Meter'];
aa.print(AInfo["Residential Companion Meter"]);

var comm = AInfo['Commercial Irrigation Service'];
aa.print(AInfo['Commercial Irrigation Service']);

if(res== "CHECKED" || comm=="CHECKED")
{
   aa.env.setValue("IRREGATION",AInfo['Water Project Number']);
}

if(newws == "CHECKED")
{
   aa.env.setValue("WATER","Y");
}
else
{
   aa.env.setValue("WATER","N");
}

if(newss =="CHECKED")
{
   aa.env.setValue("SEWER","Y");
}
else
{
   aa.env.setValue("SEWER","N");
}

if(comm =="CHECKED")
{
   aa.env.setValue("IRRIGATION","Y");
}
else
{
   aa.env.setValue("IRRIGATION","N");
}

aa.env.setValue("CLASSFICATION",AInfo['Classification']);
aa.print(AInfo['Classification']);

aa.env.setValue("CYCLE",AInfo['Cycle']);
aa.print(AInfo['Cycle']);

aa.env.setValue("ROUTE",AInfo['Route']);
aa.print(AInfo['Route']);

aa.env.setValue("NOUNITS",AInfo['Nbr Units']);
aa.print(AInfo['Nbr Units']);

aa.env.setValue("CATEGORY",getAppSpecific("Category"));
aa.print(getAppSpecific("Category"));

var treatmentcode = String(getAppSpecific("Treatment Code"));
treatmentcode  = treatmentcode.substring(0,2);
aa.print(treatmentcode);
aa.env.setValue("TREATLOC",treatmentcode);


aa.env.setValue("WATERNODE",getAppSpecific("Water Code"));
aa.print(getAppSpecific("Water Code"));

aa.env.setValue("CONNTYPE",getAppSpecific("Connection Type"));
aa.print(getAppSpecific("Connection Type"));

var down= AInfo['Downsize Commercial Irregation Service'];
aa.print(AInfo['Downsize Commercial Irregation Service']);

var up = AInfo['Upsize Commercial Irrigation Service'];
aa.print(AInfo['Upsize Commercial Irrigation Service']);

if(comm=="CHECKED")
{
   aa.env.setValue("IRRIGATIONTYPE","C");
}
if(down=="CHECKED")
{
   aa.env.setValue("IRRIGATIONTYPE","D");
}
if(up=="CHECKED")
{
   aa.env.setValue("IRRIGATIONTYPE","U");
}

var meterloc = String(getAppSpecific("Meter Location Code"));
meterloc = meterloc.substring(0,2);
aa.print(meterloc);
aa.env.setValue("METERLOC",meterloc);

aa.env.setValue("DISRIGHT",getAppSpecific("Distance Right Property Pin"));
aa.print(getAppSpecific("Distance Right Property Pin"));

aa.env.setValue("DISLEFT",getAppSpecific("Distance Left Property Pin"));
aa.print(getAppSpecific("Distance Left Property Pin"));

//field 35 and 36 is blank field for comments and irrigation comments

aa.env.setValue("CUSTNO",getAppSpecific("Customer Number"));
aa.print(getAppSpecific("Customer Number"));	

var res = getAppSpecific("Account Type");
aa.print(res);

if(res =="Residential")
{
   aa.env.setValue("CUSTNAMETYPE","R");
}
if(res =="Commercial")
{
   aa.env.setValue("CUSTNAMETYPE","C");
}

//field 39 customer name prefix is balnk field

aa.env.setValue("CUSTFN",AInfo['First Name']);
aa.print(AInfo['First Name']);

aa.env.setValue("CUSTMN",AInfo['Middle Name']);
aa.print(AInfo['Middle Name']);

aa.env.setValue("CUSTLN",AInfo['Last Name']);
aa.print(AInfo['Last Name']);

aa.env.setValue("CUSTSUFFIX",AInfo['Suffix']);
aa.print(AInfo['Suffix']);

if(res =="Residential")
{
   aa.env.setValue("SPOUSENAMETYPE","R");
}
if(res =="Commercial")
{
   aa.env.setValue("SPOUSENAMETYPE","C");
}

aa.env.setValue("SPOUSEFN",AInfo['Spouse First Name']);
aa.print(AInfo['Spouse First Name']);

aa.env.setValue("SPOUSEMN",AInfo['Spouse Middle Name']);
aa.print(AInfo['Spouse Middle Name']);

aa.env.setValue("SPOUSELN",AInfo['Spouse Last Name']);
aa.print(AInfo['Spouse Last Name']);

aa.env.setValue("SPOUSESUFFIX",AInfo['Spouse Suffix']);
aa.print(AInfo['Spouse Suffix']);	

aa.env.setValue("CUSTSSN",AInfo['SSN']);
aa.print(AInfo['SSN']);

aa.env.setValue("SPOUSESSN",AInfo['Spouse SSN']);
aa.print(AInfo['Spouse SSN']);

aa.env.setValue("WORKPHONE",AInfo['Work Phone Number']);
aa.print(AInfo['Work Phone Number']);

aa.env.setValue("HOMEPHONE",AInfo['Home Phone Number']);
aa.print(AInfo['Home Phone Number']);

aa.env.setValue("MAILSTREETNAME",AInfo['Street Name']);
aa.print(AInfo['Street Name']);

aa.env.setValue("MAILSTREETNO",AInfo['Street #']);
aa.print(AInfo['Street #']);


//field 55 blank field mailing street number Suffix

aa.env.setValue("MAILDIR",AInfo['Dir']);
aa.print(AInfo['Dir']);

aa.env.setValue("MAILSTREETNAME",AInfo['Street Name']);
aa.print(AInfo['Street Name']);

aa.env.setValue("MAILSTRSUFFIX",AInfo['Street Suffix']);
aa.print(AInfo['Street Suffix']);

aa.env.setValue("MAILADDSUIT",AInfo['Suite/Apt']);
aa.print(AInfo['Suite/Apt']);

aa.env.setValue("MAILPOBOX",AInfo['PO Box']);
aa.print(AInfo['PO Box']);

aa.env.setValue("MAILCITY",AInfo['City']);
aa.print(AInfo['City']);

aa.env.setValue("MAILSTATE",AInfo['State']);
aa.print(AInfo['State']);

aa.env.setValue("MAILZIP",AInfo['Zip Code']);
aa.print(AInfo['Zip Code']);

aa.env.setValue("METERSETDATE",AInfo['Meter set date']);
aa.print(AInfo['Meter set date']);

aa.env.setValue("WATERPAIDDATE",AInfo['Water Paid Date']);
aa.print(AInfo['Water Paid Date']);

aa.env.setValue("SEWERPAIDDATE",AInfo['Sewer Paid Date']);
aa.print(AInfo['Sewer Paid Date']);

aa.env.setValue("SEWERCONNDATE",AInfo['Sewer Connection']);
aa.print(AInfo['Sewer Connection']);

aa.env.setValue("WATERCONTNO",AInfo['Water Contract Number']);
aa.print(AInfo['Water Contract Number']);

aa.env.setValue("WATERCONTAMT",AInfo['Water Contract Amount']);
aa.print(AInfo['Water Contract Amount']);

aa.env.setValue("SEWERCONTNO",AInfo['Sewer Contract Number']);
aa.print(AInfo['Sewer Contract Number']);

aa.env.setValue("SEWERCONTAMT",AInfo['Sewer Contract Amount']);
aa.print(AInfo['Sewer Contract Amount']);

aa.env.setValue("METERFLAG",AInfo['Meter hold']);
aa.print(AInfo['Meter hold']);

aa.env.setValue("IRRIGATIONFLAG",AInfo['Meter hold']);
aa.print(AInfo['Meter hold']);

aa.env.setValue("TAPNO",AInfo['Service Number']);
aa.print(AInfo['Service Number']);

aa.env.setValue("BUILDINGNAME",AInfo['Building Name']);
aa.print(AInfo['Building Name']);


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


//---------------------------------------------------------------
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

                                                else if(strItem.toUpperCase()=="CITY")
                                                {
                                                                return capContactArray[yy].getCity();
                                                }
                                                 else if(strItem.toUpperCase()=="STATE")
                                                {
                                                                return capContactArray[yy].getState();
                                                }
                                                 else if(strItem.toUpperCase()=="ZIP")
                                                {
                                                                return capContactArray[yy].getZip();
                                                }
                                }
                }
}



function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
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

function logGlobals(globArray) {

	for (loopGlob in globArray)
		aa.print("{" + loopGlob + "} = " + globArray[loopGlob])
	}