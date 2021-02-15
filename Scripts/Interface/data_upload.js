/*------------------------------------------------------------------------------------------------------/
| Program: Data Upload 
|
| Version 1.0 - Base Version. 
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = true;
var showMessage = false;
var message = "";
var maxSeconds = 4.5 * 60;
var br = "<br>";
var recordCount = 0;
var exceptionCount = 0;
var inspCount=0;
// Set time out to 60 minutes
var timeOutInSeconds = 60*60;

/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
//eval(getScriptText("INCLUDES_BATCH"));
// INCLUDES_DATA_LOAD:
//  Custom functions for downloading a document from Accela Automation using GovXML
//	Custom functions for reading from and writing to a flat file using Java.IO
eval(getScriptText("INCLUDES_DATA_LOAD"));  

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

batchJobID = 0;
if (batchJobResult.getSuccess()) {
	batchJobID = batchJobResult.getOutput();
	logDebug("---------------------------------------------------------------");
	logDebug("Batch Job Name: " + batchJobName);
	logDebug("Batch Job ID: " + batchJobID);
}
else
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

var startDate = new Date();
var startJSDate = new Date();
startJSDate.setHours(0, 0, 0, 0);
var timeExpired = false;
var useAppSpecificGroupName = false;
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var startTime = startDate.getTime(); 		// Start timer

// Flat file upload parameters
var govXMLURL = "http://192.168.168.58:3080/wireless/GovXMLServlet"; // non-SOAP request
var govXMLUser = "xxxxx";
var govXMLPassword = "xxxxx";
var govXMLAgency = "xxxxx";
var interfaceFolder = "C:\\Users\\Domingo\\Documents\\Razavi\\Virginia\\CCVA\\ELM\\Scripts\\Interface\\EMSE_Data_Load";
var emailAddress = "ddejesus@razavi.com";
var senderEmailAddr = "noreply@accela.com";
var applicationState = null; // GovXML authentication

logDebug("Start Time: " + aa.util.formatDate(aa.util.now(),"MM-dd-YYYY hh:mm:ss"));
logDebug("Time Out Period: " + timeOutInSeconds + " seconds.");			
logDebug("Administrator Email: " + emailAddress);
logDebug("Interface Folder: " + interfaceFolder);
logDebug("---------------------------------------------------------------");

// Counters
var capExCount = 0;	
var capExStr = "";	

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

logDebug("---------------------------------------------------------------");
logDebug("Start Process");
logDebug("---------------------------------------------------------------");

mainProcess();

logDebug("---------------------------------------------------------------");
logDebug("***End Process: Elapsed Time : " + elapsed() + " Seconds***");
logDebug("---------------------------------------------------------------");


var emailContent;
	
emailContent = '';
emailContent += "Processing Results for " + batchJobName + "<br>";
emailContent += "- processing Date: " + aa.util.formatDate(aa.util.now(),"yyyyMMdd hh:mm:ss") + "<br>";
emailContent += "- elapsed time: " + elapsed() + "<br>";
emailContent += "- number of Records processed: "+ recordCount + "<br>";
emailContent += "- number of Inspection Requests processed: "+ inspCount + "<br>";
emailContent += "- number of Exceptions found: " + exceptionCount + "<br>";
emailContent += emailText;
email(emailAddress, senderEmailAddr, batchJobName+" Results", emailContent);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/** ************************************************************************************** 
*  MAIN PROCESS
*/
function mainProcess() {
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","NO MATERIAL ASSIGNED","NO MATERIAL ASSIGNED");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER CONCRETE PIPE","SEWER CONCRETE PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER CONCRETE W/MASTIC PIPE","SEWER CONCRETE W/MASTIC PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PRESTRESSED CONCRETE PIPE","PRESTRESSED CONCRETE PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER ABS PIPE SDR-35","SEWER ABS PIPE SDR-35");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC TRUSS PIPE","PVC TRUSS PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","VITRIFIED CLAY PIPE","VITRIFIED CLAY PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","CAST IRON","CAST IRON");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PLEXCO HDPE PIPE","PLEXCO HDPE PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PVC SDR (DO NOT USE)","SEWER PVC SDR (DO NOT USE)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC RIBBED(DO NOT USE)","PVC RIBBED(DO NOT USE)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC C900 W/L (DO NOT USE)","PVC C900 W/L (DO NOT USE)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","CEMENT ASBESTOS","CEMENT ASBESTOS");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER STEEL  PIPE","WATER STEEL  PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","D.I. CL52 (DO NOT USE)","D.I. CL52 (DO NOT USE)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","D.I. CL51(DO NOT USE)","D.I. CL51(DO NOT USE)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","COPPER SERVICE PIPE","COPPER SERVICE PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PVC SERVICE PIPE","WATER PVC SERVICE PIPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","MANHOLE PRECAST CONCRETE","MANHOLE PRECAST CONCRETE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","MANHOLE STANDARD TOP","MANHOLE STANDARD TOP");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","MANHOLE T-LOCK","MANHOLE T-LOCK");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","MANHOLE WATERTIGHT TOP","MANHOLE WATERTIGHT TOP");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","NEPTUNE TRIDENT T-10","NEPTUNE TRIDENT T-10");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","BADGER RECORDALL MODEL 25","BADGER RECORDALL MODEL 25");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","A BADGER ER","A BADGER ER");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","NEPTUNE TRIDENT T-8","");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","KENT","KENT");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","BADGER SC","BADGER SC");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","NEPTUNE T-8","NEPTUNE T-8");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","HERSEY MHD","HERSEY MHD");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","HERSEY MMD","HERSEY MMD");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","ROCKWELL","ROCKWELL");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","HERSEY","HERSEY");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","BADGER","BADGER");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","ROCKWELL MODEL SR","ROCKWELL MODEL SR");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","ROCKWELL MODEL SR II","ROCKWELL MODEL SR II");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","GATE VALVE DOUBLE DISC","GATE VALVE DOUBLE DISC");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","GATE VALVE RESILIENT SEATED","GATE VALVE RESILIENT SEATED");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","BUTTERFLY VALVE","BUTTERFLY VALVE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","GATE VALVE SWING OR CHECK VALVE","GATE VALVE SWING OR CHECK VALVE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PLUG VALVE - ECCENTRIC","PLUG VALVE - ECCENTRIC");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT MODEL H-200","FIRE HYDRANT MODEL H-200");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT MEDALLION","FIRE HYDRANT MEDALLION");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT CENTURIAN","FIRE HYDRANT CENTURIAN");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT929 RELIANT","FIRE HYDRANT929 RELIANT");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT METROPOLITAN 250","FIRE HYDRANT METROPOLITAN 250");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT MARK 73","FIRE HYDRANT MARK 73");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT K-81A","FIRE HYDRANT K-81A");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT K-81D","FIRE HYDRANT K-81D");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","AIR/VAC VALVE","AIR/VAC VALVE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","AIR/VAC VALVE 5401-E","AIR/VAC VALVE 5401-E");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","AIR/VAC VALVE 5402-A","AIR/VAC VALVE 5402-A");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","FIRE HYDRANT CENTURIAN A-421","FIRE HYDRANT CENTURIAN A-421");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE D.I. CLASS 51","WATER PIPE D.I. CLASS 51");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE D.I. CLASS 52","WATER PIPE D.I. CLASS 52");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE D.I. CLASS 53","WATER PIPE D.I. CLASS 53");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE D.I. CLASS 54","WATER PIPE D.I. CLASS 54");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE PVC C900","WATER PIPE PVC C900");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE PVC C900 ULTRA BLUE","WATER PIPE PVC C900 ULTRA BLUE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","WATER PIPE PVC C909","WATER PIPE PVC C909");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE D.I. CLASS 51","SEWER PIPE D.I. CLASS 51");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE D.I. CLASS 52","SEWER PIPE D.I. CLASS 52");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE D.I. CLASS 53","SEWER PIPE D.I. CLASS 53");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE D.I. CLASS 54","SEWER PIPE D.I. CLASS 54");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","R.C.P. CLASS III WALL B","R.C.P. CLASS III WALL B");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","R.C.P. CLASS III WALL C","R.C.P. CLASS III WALL C");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","R.C.P. CLASS IV WALL B","R.C.P. CLASS IV WALL B");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","R.C.P. CLASS IV WALL C","R.C.P. CLASS IV WALL C");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","R.C.P. CLASS V WALL B","R.C.P. CLASS V WALL B");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","R.C.P. CLASS V WALL C","R.C.P. CLASS V WALL C");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","HIGH-DENSITY POLYETHYLENE SPIROLITE","HIGH-DENSITY POLYETHYLENE SPIROLITE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE PVC C900 FM","SEWER PIPE PVC C900 FM");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE PVC C905 FM","SEWER PIPE PVC C905 FM");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE PVC T-1","SEWER PIPE PVC T-1");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC ULTRA-RIB","PVC ULTRA-RIB");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC CARLON-PS46","PVC CARLON-PS46");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE PVC SDR 26","SEWER PIPE PVC SDR 26");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SEWER PIPE PVC SDR 35","SEWER PIPE PVC SDR 35");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC PERMA-LOC","PVC PERMA-LOC");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SLIPLINING CONCRETE","SLIPLINING CONCRETE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SLIPLINING A/C","SLIPLINING A/C");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SLIPLINING PVC","SLIPLINING PVC");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","SLIPLINING ABS TRUSS","SLIPLINING ABS TRUSS");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PIPE SCHEDULE 40","PIPE SCHEDULE 40");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PIPE SCHEDULE 80","PIPE SCHEDULE 80");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC PIPE SCH. 40","PVC PIPE SCH. 40");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","HDPE PIPE SCH. 80","HDPE PIPE SCH. 80");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","DUCTILE IRON CLASS 51","DUCTILE IRON CLASS 51");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","DUCTILE IRON CLASS 52","DUCTILE IRON CLASS 52");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","DUCTILE IRON CLASS 53","DUCTILE IRON CLASS 53");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","DUCTILE IRON CLASS 54","DUCTILE IRON CLASS 54");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","CAST IRON","CAST IRON");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","CONCRETE","CONCRETE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","REINFORCED CONCRETE","REINFORCED CONCRETE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","PVC","PVC");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","CEMENT ASBESTOS","CEMENT ASBESTOS");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","VITRIFIED CLAY","VITRIFIED CLAY");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","HDPE","HDPE");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","ABS","ABS");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","BRICK","BRICK");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","CORRUGATED METAL (CMP)","CORRUGATED METAL (CMP)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","POLYETHYLENE (PE)","POLYETHYLENE (PE)");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","STEEL","STEEL");
	addLookup("CC-BLD-WATER-SEWER-MATERIAL-TYPE","COPPER","COPPER");

}

/** ************************************************************************************** 
*  checks for undefined or null or empty strings
*/
function isEmpty(pVariable) {
	if (pVariable === undefined || pVariable == null || pVariable == "") {
		return true;
	} else {
		return false;
	}
}

/** ************************************************************************************** 
*  
*/

/** ************************************************************************************** 
*  Print all object properties
*/
function logDebugObject(o) {
	logDebug(' *** logDebugObject: ');
  for (var p in o) {
	  logDebug(': ' + o[p]);
	} 
}

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}
