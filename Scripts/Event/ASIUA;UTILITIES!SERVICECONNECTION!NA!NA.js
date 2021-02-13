var newServNumber = Number(lookup("NEW_CONNECTION_SERVICE_NUMBER","SERVICE_NUMBER"));
var count = 1;
if (AInfo["Generate New Service Number"] == "CHECKED" && AInfo["Service Number"] ==null) {
editAppSpecific("Service Number",lookup("NEW_CONNECTION_SERVICE_NUMBER","SERVICE_NUMBER"));
editLookup("NEW_CONNECTION_SERVICE_NUMBER","SERVICE_NUMBER",zeroPad(newServNumber+count,8));
}
if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '5/8"' && !feeExists("WATERMETER")){
	addFee("WATERMETER","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '5/8"' && !feeExists("WATERMETER")){
	addFee("WATERMETER","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1"' && !feeExists("WATERMETER1")){
	addFee("WATERMETER1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1"' && !feeExists("WATERMETER1")){
	addFee("WATERMETER1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1 1/2"' && !feeExists("WATERMETER15")){
	addFee("WATERMETER15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1 1/2"' && !feeExists("WATERMETER15")){
	addFee("WATERMETER15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '2"' && !feeExists("WATERMETER2")){
	addFee("WATERMETER2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '2"' && !feeExists("WATERMETER2")){
	addFee("WATERMETER2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '5/8"' && !feeExists("SERVICELINE")){
	addFee("SERVICELINE","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '5/8"' && !feeExists("SERVICELINE")){
	addFee("SERVICELINE","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '5/8"' && !feeExists("SERVICELINE")){
	addFee("SERVICELINE","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1"' && !feeExists("SERVICELINE1")){
	addFee("SERVICELINE1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1"' && !feeExists("SERVICELINE1")){
	addFee("SERVICELINE1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1"' && !feeExists("SERVICELINE1")){
	addFee("SERVICELINE1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1 1/2"'&& !feeExists("SERVICELN15")){
	addFee("SERVICELN15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1 1/2"' && !feeExists("SERVICELN15")){
	addFee("SERVICELN15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1 1/2"' && !feeExists("SERVICELN15")){
	addFee("SERVICELN15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '2"' && !feeExists("SERVICELINE2")){
	addFee("SERVICELINE2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '2"' && !feeExists("SERVICELINE2")){
	addFee("SERVICELINE2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '2"' && !feeExists("SERVICELINE2")){
	addFee("SERVICELINE2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '5/8"' && (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAPITAL")){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAPITAL")){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAPITAL")){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAPITAL")){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP1")){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP1")){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP1")){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP1")){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP15")){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP15")){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP15")){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP15")){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP2")){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP2")){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExis2ts("SEWERCAP")){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP2")){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP3")){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP3")){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP3")){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP3")){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP4")){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP4")){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP4")){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP4")){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP6")){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP6")){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP6")){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP")){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP8")){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP8")){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP8")){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP8")){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP10")){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP10")){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP10")){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP10")){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP12")){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("WATERCAP12")){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP12")){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null) && !feeExists("SEWERCAP12")){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Category"] == "Multifamily" && !feeExists("WATERUNIT")){
	addFee("WATERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Category"] == "Multifamily" && !feeExists("WATERUNIT")){
	addFee("WATERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Category"] == "Multifamily" && !feeExists("SEWERUNIT")){
	addFee("SEWERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Category"] == "Multifamily" && !feeExists("SEWERUNIT")){
	addFee("SEWERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '5/8"' && (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAPITAL")){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAPITAL")){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAPITAL")){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAPITAL")){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP1")){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP1")){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP1")){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP1")){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP15")){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP15")){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP15")){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP15")){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP2")){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP2")){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP2")){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP2")){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP3")){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP3")){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP3")){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP3")){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP4")){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP4")){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP4")){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP4")){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP6")){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP6")){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP6")){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP6")){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP8")){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP8")){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP8")){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP8")){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP10")){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP10")){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP10")){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP10")){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP12")){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("WATERCAP12")){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP12")){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED") && !feeExists("SEWERCAP12")){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}

