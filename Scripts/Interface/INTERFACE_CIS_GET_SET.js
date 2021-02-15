var id1 = aa.env.getValue("id1");
var id2 = aa.env.getValue("id2");
var id3 = aa.env.getValue("id3");
var SCRIPT_VERSION = 3.0;
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));
var reportSet = new capSet("SET_CIS");
var reportMembers = reportSet.members;
var setarray= new Array();

for (var rm = 0; rm < reportMembers.length; rm++) // for each individual record add the appropriate document
{
				var capIdObj = aa.cap.getCapID(reportMembers[rm].getID1(), reportMembers[rm].getID2(), reportMembers[rm].getID3());
				if (capIdObj.getSuccess()) 
                               {
				capId = capIdObj.getOutput();
                                aa.print(capId.getCustomID());
                                var counter = rm;
                                counter = capId.toString();
                                aa.print("counter: " +counter);
			        setarray.push(counter);
                                aa.env.setValue("counter",rm);
                               }                                            
}

for (i = 0; i < setarray.length; i++) 
{
   aa.print("----");
   aa.print(setarray[i]);
   aa.env.setValue("RecordID" +i,setarray[i]);
 
}


function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}