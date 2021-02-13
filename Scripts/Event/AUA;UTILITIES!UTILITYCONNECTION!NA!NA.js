var streetName = AddressModel.getStreetName();
var streetType = (AddressModel.getStreetSuffix() == null) ? "" : AddressModel.getStreetSuffix();
var streetNumber = AddressModel.getHouseNumberStart();
var customListGroupName = "CC-UT-UC";

var URL = "http://auroraapp.northcentralus.cloudapp.azure.com/CISCustomerAccountNumberInterface/webservices/CISCustomerAccountNumberInterface.asmx/GetCISServiceAddress?StreetName="
		+ streetName + "&streetType=" + streetType + "&streetNumber=" + streetNumber;

var vOutObj = aa.httpClient.get(URL);
if (vOutObj.getSuccess()) {
	var result = vOutObj.getOutput();
	var JsonResult = result.replaceAll("<[^>]+>", "");
	var resultList = JSON.parse(JsonResult);
	if (resultList != null && resultList.length > 0) {
		var array = new Array();
		for ( var i in resultList) {
			var currentObj = resultList[i];
			var address = currentObj.StreetNumber + ", " + currentObj.StreetName + ", " + currentObj.ZipCode;
			var row = new Array();
			row["Account Number"] = new asiTableValObj("Account Number", currentObj.AccountNumber, "N");
			row["Address"] = new asiTableValObj("Address", address, "N");
			row["Cycle"] = new asiTableValObj("Cycle", currentObj.Cycle, "N");
			row["Route"] = new asiTableValObj("Route", currentObj.Route, "N");
			row["Water"] = new asiTableValObj("Water", currentObj.Water, "N");
			row["Sewer"] = new asiTableValObj("Sewer", currentObj.Sewer, "N");
			row["Irrigation"] = new asiTableValObj("Irrigation", currentObj.Irrigation, "N");
			row["Classification"] = new asiTableValObj("Classification", currentObj.Classification, "N");
			row["Customer Number"] = new asiTableValObj("Customer Number", currentObj.Customer, "N");
			array.push(row);
		}
		var addASIT = addASITable(customListGroupName, array, capId);
	} else {
		showMessage = true;
		comment("the provided address does not exists in the CIS system " + streetType);

	}

}
///////////////

performCISLookup();
