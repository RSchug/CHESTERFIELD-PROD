var streetName, streetType, streetNumber;
var customListGroupName = "CC-UT-UC";
fillAddressParts();


var URL = encodeURI("http://auroraapp.northcentralus.cloudapp.azure.com/CISCustomerAccountNumberInterface/webservices/CISCustomerAccountNumberInterface.asmx/GetCISServiceAddress?StreetName="
		+ streetName + "&streetType=" + streetType + "&streetNumber=" + streetNumber);

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
		comment("the provided address does not exists in the CIS system  street type =" + streetType);

	}

}
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