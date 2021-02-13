if (!publicUser) performCISLookup()

try {
var streetName, streetType, streetNumber;
var customListGroupName = "CC-UT-UC";
fillAddressParts();

// var URL = encodeURI("http://auroraapp.northcentralus.cloudapp.azure.com/CISCustomerAccountNumberInterface/webservices/CISCustomerAccountNumberInterface.asmx/GetCISServiceAddress?StreetName="
// 		+ streetName + "&streetType=" + streetType + "&streetNumber=" + streetNumber);

// var vOutObj = aa.httpClient.get(URL);
// if (vOutObj.getSuccess()) {
// 	var result = vOutObj.getOutput();
// 	var JsonResult = result.replaceAll("<[^>]+>", "");
// 	var resultList = JSON.parse(JsonResult);
// 	if (resultList != null && resultList.length > 0) {
// 		var array = new Array();
// 		for ( var i in resultList) {
// 			var currentObj = resultList[i];
// 			var address = currentObj.StreetNumber + ", " + currentObj.StreetName + ", " + currentObj.ZipCode;
// 			var row = new Array();
// 			row["Account Number"] = new asiTableValObj("Account Number", currentObj.AccountNumber, "N");
// 			row["Address"] = new asiTableValObj("Address", address, "N");
// 			row["Cycle"] = new asiTableValObj("Cycle", currentObj.Cycle, "N");
// 			row["Route"] = new asiTableValObj("Route", currentObj.Route, "N");
// 			row["Water"] = new asiTableValObj("Water", currentObj.Water, "N");
// 			row["Sewer"] = new asiTableValObj("Sewer", currentObj.Sewer, "N");
// 			row["Irrigation"] = new asiTableValObj("Irrigation", currentObj.Irrigation, "N");
// 			row["Classification"] = new asiTableValObj("Classification", currentObj.Classification, "N");
// 			row["Customer Number"] = new asiTableValObj("Customer Number", currentObj.Customer, "N");
// 			array.push(row);
// 		}
// 		var addASIT = addASITable(customListGroupName, array, capId);
// 	} else {
// 		showMessage = true;
// 		comment("the provided address does not exists in the CIS system  street type =" + streetType);

// 	}

// }
/**
 * this function will fill the address parts based on the current event
 */
function fillAddressParts() {
	if (controlString.equalsIgnoreCase("addressLookupAfter")) {
		var addressListArray = SelectedAddressList.toArray();
		if (addressListArray != null && addressListArray.length > 0) {
			streetName = addressListArray[0].getStreetName();
			streetType = (addressListArray[0].getStreetSuffix() == null) ? "" : addressListArray[0].getStreetSuffix();
			streetNumber = addressListArray[0].getHouseNumberStart();
		}
	} else if (controlString.equalsIgnoreCase("ApplicationSubmitAfter")) {
		streetName = aa.env.getValue("AddressStreetName");
		streetType = (aa.env.getValue("AddressStreetSuffix") == null) ? "" : aa.env.getValue("AddressStreetSuffix");
		streetNumber = aa.env.getValue("AddressHouseNumber");
	} else if (controlString.equalsIgnoreCase("AddressUpdateAfter") || controlString.equalsIgnoreCase("addressAddAfter")) {
		streetName = AddressModel.getStreetName();
		streetType = (AddressModel.getStreetSuffix() == null) ? "" : AddressModel.getStreetSuffix();
		streetNumber = AddressModel.getHouseNumberStart();
	}
}
if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '5/8"'){
	addFee("WATERMETER","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '5/8"'){
	addFee("WATERMETER","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1"'){
	addFee("WATERMETER1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1"'){
	addFee("WATERMETER1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1 1/2"'){
	addFee("WATERMETER15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1 1/2"'){
	addFee("WATERMETER15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '2"'){
	addFee("WATERMETER2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '2"'){
	addFee("WATERMETER2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '5/8"'){
	addFee("SERVICELINE","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '5/8"'){
	addFee("SERVICELINE","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '5/8"'){
	addFee("SERVICELINE","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1"'){
	addFee("SERVICELINE1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1"'){
	addFee("SERVICELINE1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1"'){
	addFee("SERVICELINE1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1 1/2"'){
	addFee("SERVICELN15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1 1/2"'){
	addFee("SERVICELN15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '1 1/2"'){
	addFee("SERVICELN15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '2"'){
	addFee("SERVICELINE2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '2"'){
	addFee("SERVICELINE2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Connection Type"] == "F" && AInfo["Actual Meter Size"] == '2"'){
	addFee("SERVICELINE2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '5/8"' && (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Actual Meter Size"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == null)){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Category"] == "Multifamily"){
	addFee("WATERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Category"] == "Multifamily"){
	addFee("WATERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Category"] == "Multifamily"){
	addFee("SEWERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Category"] == "Multifamily"){
	addFee("SEWERUNIT","CC-UTL-SC","FINAL",AInfo["Number of Units"],"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '5/8"' && (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '5/8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAPITAL","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP1","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '1 1/2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP15","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '2"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP2","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '3"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP3","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '4"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP4","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '6"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP6","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '8"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP8","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '10"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP10","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Water" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("WATERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Sewer" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}
	if (AInfo["Utility Type"] == "Both" && AInfo["Virtual Meter"] == '12"'&& (AInfo["Category"] != "Multifamily") && (AInfo["Virtual Meter?"] == "CHECKED")){
	addFee("SEWERCAP12","CC-UTL-SC","FINAL",1,"Y")}

//11-2020 Boucher 105aca added per call with Economic Development
	var addrArray = [];
	loadAddressAttributes(addrArray);
	var TechRev = addrArray["AddressAttribute.County"];
	
	if (TechRev != null) {
		addStdCondition('Economic Development','Eligible for Technology Zone Incentive Program');
		email('techzone@chesterfieldbusiness.com','noreply@chesterfield.gov','Record: ' + capId.getCustomID() + ' submitted in the Tech Zone','Date: ' + fileDate + ' For Record Type: ' + appTypeAlias);
	}
} catch (err) {
		logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}