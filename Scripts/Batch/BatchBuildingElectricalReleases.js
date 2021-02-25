var showDebug = true;
var debug = "";
var currentUserID = "ADMIN";
var paramsStartDt = dateAdd(null,0);                                                       // Start Date for the batch script to select ASI data on.
var paramsEndDt = dateAdd(null,0); 
var fromAddress = "noreply@chesterfield.gov";
var toAddress = "lackeym@chesterfield.gov;vera.e.martin@dominionenergy.com;tracey.seamster@sec.coop;susan.zediak@dominionenergy.com;sara.franklin@dom.com;cassina.west@sec.coop;edwina.linaras@dominionenergy.com;angela.lawson@sec.coop;DVPPetersburgInspections@dominionenergy.com";
var ccAddress = "mbouquin@truepointsolutions.com";
var reportSubject = "Daily Electrical Releases report for " + paramsStartDt;
var reportContent = "Daily Electrical Releases report for " + paramsStartDt;
var aaReportName = "Electrical Releases";
                    
var myHashMap = aa.util.newHashMap();

/*
| Note: Start Date and End Date are defaulted to use the current System Date.
|       To set the Start Date and End Date to specific values for a manual run
|       replace the following syntax dateAdd(null,-1) to a string date value
|       in the following format "MM/DD/YYYY".
*/
//myHashMap.put("StartDate","08/01/2014");
//myHashMap.put("EndDate","08/10/2014");
myHashMap.put("StartDate",paramsStartDt);
myHashMap.put("EndDate",paramsEndDt);
//myHashMap.put("RecordID","ALL");
//var filename = runReport();
aa.print("EMSE report test");
sendEmailwAttchmnt(fromAddress,toAddress,ccAddress,reportSubject,reportContent,aaReportName,myHashMap);
function sendEmailwAttchmnt(fromAddress,toAddress,ccAddress,reportSubject,reportContent,aaReportName,parameters)
{
	var reportName = aaReportName;
	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput(); 
	report.setModule("Building"); 
	//report.setCapId(capId); 
	//var parameters = aa.util.newHashMap();	
	//Make sure the parameters includes some key parameters. 
	//parameters.put("FromDate",aaReportParamValue1);
	//parameters.put("ToDate", aaReportParamValue2);
	//parameters.put("ReportType", aaReportParamValue3);
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
	{ 
		var reportResult = aa.reportManager.getReportResult(report); 
		
		if(reportResult) 
		{ 
			reportResult = reportResult.getOutput(); 
			var reportFile = aa.reportManager.storeReportToDisk(reportResult); 

			reportFile = reportFile.getOutput();
			var sendResult = aa.sendEmail(fromAddress,toAddress,ccAddress, reportSubject, reportContent, reportFile);
		}
		if(sendResult.getSuccess()) 
			aa.print("A copy of this report has been sent to the valid email addresses."); 
		else 
			aa.print("System failed send report to selected email addresses because mail server is broken or report file size is great than 5M."); 
	}
	else
		aa.print("No permission to report: "+ reportName + " for Admin" + currentUserID);
}
function dateAdd(td,amt)
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	// if optional parameter #3 is present, use working days only
	{
	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;
	if (!td)
		dDate = new Date();
	else
		dDate = new Date(td);
	var i = 0;
	if (useWorking)
		if (!aa.calendar.getNextWorkDay)
			{
			logDebug("**ERROR","getNextWorkDay function is only available in Accela Automation 6.3.2 or higher.");
			while (i < Math.abs(amt))
				{
				dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * (amt > 0 ? 1 : -1)));
				if (dDate.getDay() > 0 && dDate.getDay() < 6)
					i++
				}
			}
		else
			{
			while (i < Math.abs(amt))
				{
				dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
				i++;
				}
			}
	else
		dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));

	return (dDate.getMonth()+1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
	}