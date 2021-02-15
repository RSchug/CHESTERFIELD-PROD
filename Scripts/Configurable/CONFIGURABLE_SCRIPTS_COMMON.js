/**
 * CONFIGURABLE_SCRIPTS_COMMON
 *
 */

var SCRIPT_VERSION = 3.0;
// Support ACA and AV, without messing with Global publicUser
var currUserId = aa.env.getValue("CurrentUserID");
var isPublicUser = false;
if (typeof publicUser === 'undefined') {
	isPublicUser = currUserId.indexOf("PUBLICUSER") == 0;
} else {
	isPublicUser = publicUser;
}

var asiGroups;

if (isPublicUser && (typeof controlString === 'undefined' || controlString == "Pageflow") && (typeof capId === 'undefined' || capId == null)) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
	eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
	var capModel = aa.env.getValue("CapModel");
	var cap = capModel;
	capId = capModel.getCapID();
	asiGroups = capModel.getAppSpecificInfoGroups();

}
// this in case of there is capId and cap object is undefined.
else if (typeof cap === 'undefined' && capId != null) {
	cap = aa.cap.getCap(capId).getOutput();

}

/**
 * Check if appType is defined in StandardChoice, and fills Settings array
 *
 * @Param settingsArray
 *            array to be populated
 * @Param ignoreEvent optional parameter if true then will ignore the checking the event from the JSON else will include the event this is used in STDBASE_ACA_AUTO_ISSUANCE script.           
 *
 * @returns true if JSON configuration is set for the record type and if a
 *          ruleset for the recordType/Event is defined in JSON , false if not.
 */

function isConfigurableScript(settingsArray, jsonFileSuffix) {
	var ignoreEvent = false;
	if (arguments.length == 3) {
		ignoreEvent = arguments[2];
	}

	// delete this if "Pageflow" passed from GLOBAL SCRIPTS
	if (isPublicUser && typeof controlString === 'undefined') {
		controlString = "Pageflow";
	}

	//to prevent the document upload after and before on ACA insert mode. because we done have cap or cap model.
	if (isPublicUser && capId.toString().indexOf("EST") > -1 && controlString.indexOf("DocumentUpload") > -1) {
		return false;
	}

	var itemCap, itemAppTypeResult, itemAppTypeString, itemAppTypeArray, itemAppTypeArray;
	if (capId != null) {
		itemCap = aa.cap.getCap(capId).getOutput();
		itemAppTypeResult = itemCap.getCapType();
		itemAppTypeString = itemAppTypeResult.toString();
		itemAppTypeArray = itemAppTypeString.split('/');
		module = itemAppTypeArray[0].toUpperCase();
	} else {
		itemAppTypeArray = appTypeArray;
		itemAppTypeString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3];
		module = appTypeArray[0].toUpperCase();

	}

	var solMapStdChoice = "SOLUTION_MAPPING";
	var solution = lookup(solMapStdChoice, itemAppTypeString);
	if (!solution) {
		solution = lookup(solMapStdChoice, itemAppTypeArray[0] + "/" + itemAppTypeArray[1] + "/" + itemAppTypeArray[2] + "/*");
	}
	if (!solution) {
		solution = lookup(solMapStdChoice, itemAppTypeArray[0] + "/" + itemAppTypeArray[1] + "/*/*");
	}
	if (!solution) {
		solution = lookup(solMapStdChoice, itemAppTypeArray[0] + "/*/*/*");
	}
	if (!solution) {
		return false;
	}

	var jsonName = "CONF_" + solution + "_" + jsonFileSuffix;
	//logDebug("jsonName: " + jsonName);
	var cfgJsonStr = getScriptText(jsonName);
	if (cfgJsonStr == "") { return false }
	//logDebug("cfgJsonStr: " + cfgJsonStr)
	var cfgJsonObj = JSON.parse(cfgJsonStr);
	var ruleSet = "";

	//logDebug("controlString: " + controlString);

	if (controlString.indexOf("Workflow") > -1) {
		ruleSet = controlString + "/" + wfTask + "/" + wfStatus;
	} else if (controlString.indexOf("Inspection") > -1) {
		ruleSet = controlString + "/" + inspType + "/" + inspResult;
	} else {
		ruleSet = controlString;
	}
	//logDebug("ruleSet: " + ruleSet);
	/// this to handle the document type and document category since the user my upload more than one category and group.

	if (controlString.indexOf("Document") > -1) {
		for (var d = 0; d < documentModelArray.size(); d++) {
			var documentgroup = documentModelArray.get(d).getDocGroup();
			var documentCategory = documentModelArray.get(d).getDocCategory();
			ruleSet = controlString + "/" + documentgroup + "/" + documentCategory;
			settingsArray = fillSettingsArray(itemAppTypeArray, settingsArray, ruleSet, cfgJsonObj, ignoreEvent);
		}
	} else {
		settingsArray = fillSettingsArray(itemAppTypeArray, settingsArray, ruleSet, cfgJsonObj, ignoreEvent);
	}

	return (settingsArray != null && settingsArray.length > 0);
}

function fillSettingsArray(itemType, settingsArray, ruleSet, configJsonObj, ignoreEvent) {
	var itemTypeTemplate = [ "/*/*/*", "/*/*", "/*", "" ]; // FINAL
	var length = itemType.length;
	//support /*/* in ruleSet.
	var ruleSetOptions = new Array();

	if (ruleSet.indexOf("/") != -1) {
		var ruleSetPartsTemp = ruleSet.split("/");
		ruleSetOptions.push(ruleSetPartsTemp[0] + "/*/" + ruleSetPartsTemp[2]);
		ruleSetOptions.push(ruleSetPartsTemp[0] + "/" + ruleSetPartsTemp[1] + "/*");
		ruleSetOptions.push(ruleSetPartsTemp[0] + "/" + ruleSetPartsTemp[1] + "/" + ruleSetPartsTemp[2]);
		ruleSetOptions.push(ruleSetPartsTemp[0] + "/*/*");
	} else {
		ruleSetOptions.push(ruleSet); // ex Pageflow
	}
	//logDebug("ruleSetOptions: " + ruleSetOptions + "(" + ruleSetOptions.length + ")");
	for (i in itemType) {
		var itemTypeStr = "";

		for (var e = 0; e <= i; e++) {
			itemTypeStr += itemType[e];
			if (e + 1 <= i) {
				itemTypeStr += "/";
			}
		}

		itemTypeStr += itemTypeTemplate[i];

		//logDebug("itemTypeStr: " + itemTypeStr);

		if (configJsonObj[itemTypeStr]) {
			//logDebug("JSON Found: " + configJsonObj[itemTypeStr])

			for (ro in ruleSetOptions) {

				if (configJsonObj[itemTypeStr][ruleSetOptions[ro]]) {
					//logDebug("Ruleset found: " + configJsonObj[itemTypeStr][ruleSetOptions[ro]]);

					var ruleSetArray = configJsonObj[itemTypeStr][ruleSetOptions[ro]];
					//logDebug("ruleSetArray: " + ruleSetArray + "(" + ruleSetArray.length + ")");
					if (ruleSetArray.length > 0) {
						for (r in ruleSetArray) {

							settingsArray.push(ruleSetArray[r]);

						}
					} else {
						settingsArray.push(ruleSetArray);
					}
				} // by itemType and ruleSet
				else if (ignoreEvent) {
					var ruleSetArray = configJsonObj[itemTypeStr];

					if (ruleSetArray.length > 0) {
						for (r in ruleSetArray) {

							settingsArray.push(ruleSetArray[r]);

						}
					} else {
						settingsArray.push(ruleSetArray);
					}
				} //for all ruleSetOptions based on the event that provided from JSON
			}
		}// in case there is no event provided in the JSON
	} // for item type parts
	return settingsArray;
}

function getContacts() {
	var ContactModel = aa.env.getValue("Contact");
	var ContactModelList = aa.env.getValue("SelectedContactList");
	if (controlString == "ApplicationSubmitBefore") {
		return getContactsFromSessionForASB();
	} else if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return getContactsFromSession4ACA();
	} else if (ContactModel != "" || ContactModelList != "") {
		return getContactsFromSessionAV();
	} else {
		return getContactsList();
	}
}

function getParcel(parcelArray) {
	var ParcelList = aa.env.getValue("SelectedParcelList");
	var ParcelObject = aa.env.getValue("parcelModel");

	if (controlString == "ApplicationSubmitBefore") {
		return LoadParcelAttributesForASB(parcelArray);
	}
	if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return LoadParcelFromSession(parcelArray);
	} else if (ParcelList != "" || ParcelObject != "") {
		LoadPacelFromAVSession(parcelArray);
	} else if (capId != null) {
		return loadParcelAttributes(parcelArray);

	}

}

function getAddress(thisArr) {
	var addressModel = aa.env.getValue("AddressModel");
	var addressModelList = aa.env.getValue("SelectedAddressList");
	if (controlString == "ApplicationSubmitBefore") {
		return LoadAddressAttributesForASB(thisArr);
	} else if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return loadAddressAndAttributesFromSession4ACA(thisArr);
	} else if (addressModel != "" || addressModelList != "") {
		loadAddressAttributesSessionAV(thisArr);
	} else {
		return loadAddressAttributesLocalAV(thisArr);
	}

}

//this function to get the address attribute from the session in ACA and AV for ASB EVENT
function LoadAddressAttributesForASB(thisArr) {
	if (aa.env.getValue("AddressPrimaryFlag") != "" || aa.env.getValue("AddressStreetDirection") != "" || aa.env.getValue("AddressStreetName") != ""
			|| aa.env.getValue("AddressStreetSuffix") != "" || aa.env.getValue("AddressCity") != "" || aa.env.getValue("AddressZip") != ""
			|| aa.env.getValue("AddressValidatedNumber") != "" || aa.env.getValue("AddressHouseNumber") != "" || aa.env.getValue("AddressHouseFraction") != ""
			|| aa.env.getValue("AddressUnitNumber") != "" || aa.env.getValue("AddressUnitType") != "" || aa.env.getValue("AddressState") != "") {
		var address = new Array();
		address["primaryFlag"] = aa.env.getValue("AddressPrimaryFlag");
		address["streetDirection"] = aa.env.getValue("AddressStreetDirection");
		address["streetName"] = aa.env.getValue("AddressStreetName");
		address["streetSuffix"] = aa.env.getValue("AddressStreetSuffix");
		address["city"] = aa.env.getValue("AddressCity");
		address["zip"] = aa.env.getValue("AddressZip");
		address["ValidatedNumber"] = aa.env.getValue("AddressValidatedNumber");
		address["HouseNumber"] = aa.env.getValue("AddressHouseNumber");
		address["HouseFraction"] = aa.env.getValue("AddressHouseFraction");
		address["AddressUnitNumber"] = aa.env.getValue("AddressUnitNumber");
		address["AddressUnitType"] = aa.env.getValue("AddressUnitType");
		address["AddressState"] = aa.env.getValue("AddressState");
		thisArr.push(address);
	}
}

function loadAddressAttributesSessionAV(thisArr) {

	var addressModel = aa.env.getValue("AddressModel");
	var addressModelList = aa.env.getValue("SelectedAddressList");

	if (addressModelList != "") {
		for (var i = 0; i < addressModelList.size(); i++) {
			var address = new Array();
			// Explicitly load some standard values
			address["primaryFlag"] = addressModelList.get(i).getPrimaryFlag();
			address["houseNumberStart"] = addressModelList.get(i).getHouseNumberStart();
			address["streetDirection"] = addressModelList.get(i).getStreetDirection();
			address["streetName"] = addressModelList.get(i).getStreetName();
			address["streetSuffix"] = addressModelList.get(i).getStreetSuffix();
			address["city"] = addressModelList.get(i).getCity();
			address["state"] = addressModelList.get(i).getState();
			address["zip"] = addressModelList.get(i).getZip();
			address["addressStatus"] = addressModelList.get(i).getAddressStatus();
			address["county"] = addressModelList.get(i).getCounty();
			address["country"] = addressModelList.get(i).getCountry();
			address["addressDescription"] = addressModelList.get(i).getAddressDescription();
			address["xCoordinate"] = addressModelList.get(i).getXCoordinator();
			address["yCoordinate"] = addressModelList.get(i).getYCoordinator();

			addressAttrObj = addressModelList.get(i).getAttributes().toArray();
			for (z in addressAttrObj)
				address[addressAttrObj[z].getB1AttributeName()] = addressAttrObj[z].getB1AttributeValue();

			thisArr.push(address)
		}
	} else {

		var address = new Array();
		// Explicitly load some standard values
		address["primaryFlag"] = addressModel.getPrimaryFlag();
		address["houseNumberStart"] = addressModel.getHouseNumberStart();
		address["streetDirection"] = addressModel.getStreetDirection();
		address["streetName"] = addressModel.getStreetName();
		address["streetSuffix"] = addressModel.getStreetSuffix();
		address["city"] = addressModel.getCity();
		address["state"] = addressModel.getState();
		address["zip"] = addressModel.getZip();
		address["addressStatus"] = addressModel.getAddressStatus();
		address["county"] = addressModel.getCounty();
		address["country"] = addressModel.getCountry();
		address["addressDescription"] = addressModel.getAddressDescription();
		address["xCoordinate"] = addressModel.getXCoordinator();
		address["yCoordinate"] = addressModel.getYCoordinator();
		var addressAttrObj = aa.env.getValue("AddressAttribute");
		if (addressAttrObj != "") {
			addressAttrObj = addressAttrObj.toArray();
			for (z in addressAttrObj)
				address[addressAttrObj[z].getB1AttributeName()] = addressAttrObj[z].getB1AttributeValue();
		}

		thisArr.push(address)

	}

}

function loadAddressAttributesLocalAV(thisArr) {
	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	// var fcapAddressObj = null;
	var capAddressResult = aa.address.getAddressWithAttributeByCapId(itemCap);
	if (capAddressResult.getSuccess())
		var fcapAddressObj = capAddressResult.getOutput();
	else
		logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage())

	for (i in fcapAddressObj) {

		var address = new Array();
		addressAttrObj = fcapAddressObj[i].getAttributes().toArray();
		for (z in addressAttrObj)
			address[addressAttrObj[z].getB1AttributeName()] = addressAttrObj[z].getB1AttributeValue();

		// Explicitly load some standard values
		address["primaryFlag"] = fcapAddressObj[i].getPrimaryFlag();
		address["houseNumberStart"] = fcapAddressObj[i].getHouseNumberStart();
		address["streetDirection"] = fcapAddressObj[i].getStreetDirection();
		address["streetName"] = fcapAddressObj[i].getStreetName();
		address["streetSuffix"] = fcapAddressObj[i].getStreetSuffix();
		address["city"] = fcapAddressObj[i].getCity();
		address["state"] = fcapAddressObj[i].getState();
		address["zip"] = fcapAddressObj[i].getZip();
		address["addressStatus"] = fcapAddressObj[i].getAddressStatus();
		address["county"] = fcapAddressObj[i].getCounty();
		address["country"] = fcapAddressObj[i].getCountry();
		address["addressDescription"] = fcapAddressObj[i].getAddressDescription();
		address["xCoordinate"] = fcapAddressObj[i].getXCoordinator();
		address["yCoordinate"] = fcapAddressObj[i].getYCoordinator();

		thisArr.push(address);
	}
}

function GetASIValue(asiFieldName) {
	if (controlString == "ApplicationSubmitBefore") {
		return AInfo[asiFieldName];
	}

	else if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return getFieldValue(asiFieldName, asiGroups);
	} else {
		return AInfo[asiFieldName];
	}
}

function getASITable(tableName) {
	if (controlString == "ApplicationSubmitBefore") {
		return loadASITable(tableName);
	} else if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return getASITablesRowsFromSession4ACA(tableName);
	} else {
		return loadASITable(tableName);
	}
}

function getLPFields(returnArray) {
	var LPModel = aa.env.getValue("LicProfModel");
	var LPModelList = aa.env.getValue("LicenseList");

	if (controlString == "ApplicationSubmitBefore") {
		getLPfromSessionForASB(returnArray);
	} else if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		return loadlicensedProfessional(returnArray);
	} else if (LPModel != "" || LPModelList != "") {
		getLPFieldsAVSession(returnArray);
	} else {
		return getLPFieldsAV(returnArray);
	}
}
//this function to get the LP attribute from the session in ACA and AV for ASB EVENT
function getLPfromSessionForASB(returnArray) {
	var LPModelList = aa.env.getValue("LicProfList");

	if (LPModelList != "") {
		for (var i = 0; i < LPModelList.size(); i++) {

			var lp = new Array();
			lp["licType"] = LPModelList.get(i).getLicenseType();
			lp["lastName"] = LPModelList.get(i).getContactLastName();
			lp["firstName"] = LPModelList.get(i).getContactFirstName();
			lp["businessName"] = LPModelList.get(i).getBusinessName();
			lp["address1"] = LPModelList.get(i).getAddress1();
			lp["city"] = LPModelList.get(i).getCity();
			lp["state"] = LPModelList.get(i).getState();
			lp["zip"] = LPModelList.get(i).getZip();
			lp["country"] = LPModelList.get(i).getCountry();
			lp["email"] = LPModelList.get(i).getEmail();
			lp["phone1"] = LPModelList.get(i).getPhone1();
			lp["phone2"] = LPModelList.get(i).getPhone2();
			lp["lastRenewalDate"] = LPModelList.get(i).getLastRenewalDate();
			lp["licExpirationDate"] = LPModelList.get(i).getLicenseExpirDate();
			lp["FEIN"] = LPModelList.get(i).getFein();
			lp["gender"] = LPModelList.get(i).getGender();
			lp["birthDate"] = LPModelList.get(i).getBirthDate();

			var tmpAttrList = LPModelList.get(i).getAttributes();
			for (xx1 in tmpAttrList) {
				lp[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
			}

			returnArray.push(lp)

		}
	}
}

function getLPFieldsAVSession(returnArray) {
	var LiceProfessionalobject = aa.env.getValue("LicProfModel");
	var LPModelList = aa.env.getValue("LicenseList");

	if (LPModelList != "") {

		for (var i = 0; i < LPModelList.size(); i++) {

			var lp = new Array();
			lp["licType"] = LPModelList.get(i).getLicenseType();
			lp["lastName"] = LPModelList.get(i).getContactLastName();
			lp["firstName"] = LPModelList.get(i).getContactFirstName();
			lp["businessName"] = LPModelList.get(i).getBusinessName();
			lp["address1"] = LPModelList.get(i).getAddress1();
			lp["city"] = LPModelList.get(i).getCity();
			lp["state"] = LPModelList.get(i).getState();
			lp["zip"] = LPModelList.get(i).getZip();
			lp["country"] = LPModelList.get(i).getCountry();
			lp["email"] = LPModelList.get(i).getEmail();
			lp["phone1"] = LPModelList.get(i).getPhone1();
			lp["phone2"] = LPModelList.get(i).getPhone2();
			lp["lastRenewalDate"] = LPModelList.get(i).getLastRenewalDate();
			lp["licExpirationDate"] = LPModelList.get(i).getLicenseExpirDate();
			lp["FEIN"] = LPModelList.get(i).getFein();
			lp["gender"] = LPModelList.get(i).getGender();
			lp["birthDate"] = LPModelList.get(i).getBirthDate();

			var tmpAttrList = LPModelList.get(i).getAttributes();
			for (xx1 in tmpAttrList) {
				lp[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
			}

			returnArray.push(lp)

		}
	} else {
		var lp = new Array();
		lp["licType"] = LiceProfessionalobject.getLicenseType();
		lp["lastName"] = LiceProfessionalobject.getContactLastName();
		lp["firstName"] = LiceProfessionalobject.getContactFirstName();
		lp["businessName"] = LiceProfessionalobject.getBusinessName();
		lp["address1"] = LiceProfessionalobject.getAddress1();
		lp["city"] = LiceProfessionalobject.getCity();
		lp["state"] = LiceProfessionalobject.getState();
		lp["zip"] = LiceProfessionalobject.getZip();
		lp["country"] = LiceProfessionalobject.getCountry();
		lp["email"] = LiceProfessionalobject.getEmail();
		lp["phone1"] = LiceProfessionalobject.getPhone1();
		lp["phone2"] = LiceProfessionalobject.getPhone2();
		lp["lastRenewalDate"] = LiceProfessionalobject.getLastRenewalDate();
		lp["licExpirationDate"] = LiceProfessionalobject.getLicenseExpirDate();
		lp["FEIN"] = LiceProfessionalobject.getFein();
		lp["gender"] = LiceProfessionalobject.getGender();
		lp["birthDate"] = LiceProfessionalobject.getBirthDate();

		var tmpAttrList = LiceProfessionalobject.getAttributes();
		for (xx1 in tmpAttrList) {
			lp[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
		}

		returnArray.push(lp)
	}
}

function getLPFieldsAV(returnArray) {
	var rArray = new Array();
	licArr = getLicenseProfessional(capId);
	for (i in licArr) {

		var lp = new Array();
		lp["licType"] = licArr[i].getLicenseType();
		lp["lastName"] = licArr[i].getContactLastName();
		lp["firstName"] = licArr[i].getContactFirstName();
		lp["businessName"] = licArr[i].getBusinessName();
		lp["address1"] = licArr[i].getAddress1();
		lp["city"] = licArr[i].getCity();
		lp["state"] = licArr[i].getState();
		lp["zip"] = licArr[i].getZip();
		lp["country"] = licArr[i].getCountry();
		lp["email"] = licArr[i].getEmail();
		lp["phone1"] = licArr[i].getPhone1();
		lp["phone2"] = licArr[i].getPhone2();
		lp["lastRenewalDate"] = licArr[i].getLastRenewalDate();
		lp["licExpirationDate"] = licArr[i].getLicenseExpirDate();
		lp["FEIN"] = licArr[i].getFein();
		lp["gender"] = licArr[i].getGender();
		lp["birthDate"] = licArr[i].getBirthDate();

		var tmpAttrList = licArr[i].getAttributes();
		for (xx1 in tmpAttrList) {
			lp[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
		}
		returnArray.push(lp)

	}
}

function loadAddressAndAttributesFromSession4ACA(addressArray) {
	var addressModel = cap.getAddressModel();

	if (addressModel == null) {
		return false;
	}

	var address = new Array();
	if (addressModel.getAttributes() != null) {
		addressAttrObj = addressModel.getAttributes().toArray();
		for (z in addressAttrObj)
			address[addressAttrObj[z].getB1AttributeName()] = addressAttrObj[z].getB1AttributeValue();
	}

	address["primaryFlag"] = addressModel.getPrimaryFlag();
	address["houseNumberStart"] = addressModel.getHouseNumberStart();
	address["streetDirection"] = addressModel.getStreetDirection();
	address["streetName"] = addressModel.getStreetName();
	address["streetSuffix"] = addressModel.getStreetSuffix();
	address["city"] = addressModel.getCity();
	address["state"] = addressModel.getState();
	address["zip"] = addressModel.getZip();
	address["addressStatus"] = addressModel.getAddressStatus();
	address["county"] = addressModel.getCounty();
	address["country"] = addressModel.getCountry();
	address["addressDescription"] = addressModel.getAddressDescription();
	address["xCoordinate"] = addressModel.getXCoordinator();
	address["yCoordinate"] = addressModel.getYCoordinator();
	addressArray.push(address)

	return true;
}

function loadlicensedProfessional(returnArray) {
	var licArr = capModel.getLicenseProfessionalList();
	if (licArr == null || licArr.size() == 0) {
		return false;
	}
	for (var i = 0; i < licArr.size(); i++) {
		var license = new Array();
		license["licType"] = licArr.get(i).getLicenseType();
		license["lastName"] = licArr.get(i).getContactLastName();
		license["firstName"] = licArr.get(i).getContactFirstName();
		license["businessName"] = licArr.get(i).getBusinessName();
		license["address1"] = licArr.get(i).getAddress1();
		license["city"] = licArr.get(i).getCity();
		license["state"] = licArr.get(i).getState();
		license["zip"] = licArr.get(i).getZip();
		license["country"] = licArr.get(i).getCountry();
		license["email"] = licArr.get(i).getEmail();
		license["phone1"] = licArr.get(i).getPhone1();
		license["phone2"] = licArr.get(i).getPhone2();
		license["lastRenewalDate"] = licArr.get(i).getLastRenewalDate();
		license["licExpirationDate"] = licArr.get(i).getLicenseExpirDate();
		license["FEIN"] = licArr.get(i).getFein();
		license["gender"] = licArr.get(i).getGender();
		license["birthDate"] = licArr.get(i).getBirthDate();

		var tmpAttrList = licArr.get(i).getAttributes();
		for (xx1 in tmpAttrList) {
			license[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
		}
		returnArray.push(license);
	}
}
//this function to get the parcel attribute from the session in ACA and AV for ASB EVENT
function LoadParcelAttributesForASB(thisArr) {
	var parcel = new Array();
	parcel["ParcelNumber"] = aa.env.getValue("ParcelValidatedNumber");
	parcel["Block"] = aa.env.getValue("ParcelBlock");
	parcel["Page"] = aa.env.getValue("ParcelPage");
	parcel["ExemptValue"] = aa.env.getValue("ParcelExcemptValue");
	parcel["Book"] = aa.env.getValue("ParcelBook");
	parcel["ParcelImprovedValue"] = aa.env.getValue("ParcelImprovedValue");
	parcel["Lot"] = aa.env.getValue("ParcelLot");
	parcel["ParcelArea"] = aa.env.getValue("ParcelArea");
	parcel["ParcelTract"] = aa.env.getValue("ParcelTract");
	parcel["ParcelLegalDescription"] = aa.env.getValue("ParcelLegalDescription");
	parcel["ParcelLandValue"] = aa.env.getValue("ParcelLandValue");
	thisArr.push(parcel);

}

function loadParcelAttributes(thisArr) {
	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	var fcapParcelObj = null;
	var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
	if (capParcelResult.getSuccess())
		var fcapParcelObj = capParcelResult.getOutput().toArray();
	else
		logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage())

	for (i in fcapParcelObj) {

		var parcel = new Array();

		parcelAttrObj = fcapParcelObj[i].getParcelAttribute().toArray();
		for (z in parcelAttrObj)
			parcel["ParcelAttribute." + parcelAttrObj[z].getB1AttributeName()] = parcelAttrObj[z].getB1AttributeValue();

		// Explicitly load some standard values
		parcel["ParcelNumber"] = fcapParcelObj[i].getParcelNumber();
		parcel["Section"] = fcapParcelObj[i].getSection();
		parcel["Block"] = fcapParcelObj[i].getBlock();
		parcel["LegalDesc"] = fcapParcelObj[i].getLegalDesc();
		parcel["GisSeqNo"] = fcapParcelObj[i].getGisSeqNo();
		parcel["SourceSeqNumber"] = fcapParcelObj[i].getSourceSeqNumber();
		parcel["Page"] = fcapParcelObj[i].getPage();
		parcel["I18NSubdivision"] = fcapParcelObj[i].getI18NSubdivision();
		parcel["CouncilDistrict"] = fcapParcelObj[i].getCouncilDistrict();
		parcel["RefAddressTypes"] = fcapParcelObj[i].getRefAddressTypes();
		parcel["ParcelStatus"] = fcapParcelObj[i].getParcelStatus();
		parcel["ExemptValue"] = fcapParcelObj[i].getExemptValue();
		parcel["PublicSourceSeqNBR"] = fcapParcelObj[i].getPublicSourceSeqNBR();
		parcel["CensusTract"] = fcapParcelObj[i].getCensusTract();
		parcel["InspectionDistrict"] = fcapParcelObj[i].getInspectionDistrict();
		parcel["NoticeConditions"] = fcapParcelObj[i].getNoticeConditions();
		parcel["ImprovedValue"] = fcapParcelObj[i].getImprovedValue();
		parcel["PlanArea"] = fcapParcelObj[i].getPlanArea();
		parcel["Lot"] = fcapParcelObj[i].getLot();
		parcel["ParcelArea"] = fcapParcelObj[i].getParcelArea();
		parcel["Township"] = fcapParcelObj[i].getTownship();
		parcel["LandValue"] = fcapParcelObj[i].getLandValue();

		thisArr.push(parcel);
	}
}

function LoadPacelFromAVSession(parcelArray) {

	var SelectedParcelList = aa.env.getValue("SelectedParcelList");
	var ParcelModel = aa.env.getValue("parcelModel");

	if (SelectedParcelList != "") {
		for (var i = 0; i < SelectedParcelList.size(); i++) {
			var parcel = new Array();
			parcel["ParcelNumber"] = SelectedParcelList.get(i).getParcelModel().getParcelNo();
			parcel["Section"] = SelectedParcelList.get(i).getParcelModel().getSection();
			parcel["Block"] = SelectedParcelList.get(i).getParcelModel().getBlock();
			parcel["LegalDesc"] = SelectedParcelList.get(i).getParcelModel().getLegalDesc();
			parcel["GisSeqNo"] = SelectedParcelList.get(i).getParcelModel().getGisSeqNo();
			parcel["SourceSeqNumber"] = SelectedParcelList.get(i).getParcelModel().getSourceSeqNumber();
			parcel["Page"] = SelectedParcelList.get(i).getParcelModel().getPage();
			parcel["I18NSubdivision"] = SelectedParcelList.get(i).getParcelModel().getI18NSubdivision();
			parcel["CouncilDistrict"] = SelectedParcelList.get(i).getParcelModel().getCouncilDistrict();
			parcel["RefAddressTypes"] = SelectedParcelList.get(i).getParcelModel().getRefAddressTypes();
			parcel["ParcelStatus"] = SelectedParcelList.get(i).getParcelModel().getParcelStatus();
			parcel["ExemptValue"] = SelectedParcelList.get(i).getParcelModel().getExemptValue();
			parcel["PublicSourceSeqNBR"] = parcelModel.getParcelModel().getPublicSourceSeqNBR();
			parcel["CensusTract"] = SelectedParcelList.get(i).getParcelModel().getCensusTract();
			parcel["InspectionDistrict"] = SelectedParcelList.get(i).getParcelModel().getInspectionDistrict();
			parcel["NoticeConditions"] = SelectedParcelList.get(i).getParcelModel().getNoticeConditions();
			parcel["ImprovedValue"] = SelectedParcelList.get(i).getParcelModel().getImprovedValue();
			parcel["PlanArea"] = SelectedParcelList.get(i).getParcelModel().getPlanArea();
			parcel["Lot"] = SelectedParcelList.get(i).getParcelModel().getLot();
			parcel["ParcelArea"] = SelectedParcelList.get(i).getParcelModel().getParcelArea();
			parcel["Township"] = SelectedParcelList.get(i).getParcelModel().getTownship();
			parcel["LandValue"] = SelectedParcelList.get(i).getParcelModel().getLandValue();

			var tmpAttrList = SelectedParcelList.get(i).getParcelModel().getParcelAttribute();
			for (xx1 in tmpAttrList) {
				parcel[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
			}

			parcelArray.push(parcel);
		}
	} else {
		var parcel = new Array();
		parcel["ParcelNumber"] = ParcelModel.getParcelModel().getParcelNo();
		parcel["Section"] = ParcelModel.getParcelModel().getSection();
		parcel["Block"] = ParcelModel.getParcelModel().getBlock();
		parcel["LegalDesc"] = ParcelModel.getParcelModel().getLegalDesc();
		parcel["GisSeqNo"] = ParcelModel.getParcelModel().getGisSeqNo();
		parcel["SourceSeqNumber"] = ParcelModel.getParcelModel().getSourceSeqNumber();
		parcel["Page"] = ParcelModel.getParcelModel().getPage();
		parcel["I18NSubdivision"] = ParcelModel.getParcelModel().getI18NSubdivision();
		parcel["CouncilDistrict"] = ParcelModel.getParcelModel().getCouncilDistrict();
		parcel["RefAddressTypes"] = ParcelModel.getParcelModel().getRefAddressTypes();
		parcel["ParcelStatus"] = ParcelModel.getParcelModel().getParcelStatus();
		parcel["ExemptValue"] = ParcelModel.getParcelModel().getExemptValue();
		parcel["PublicSourceSeqNBR"] = parcelModel.getParcelModel().getPublicSourceSeqNBR();
		parcel["CensusTract"] = ParcelModel.getParcelModel().getCensusTract();
		parcel["InspectionDistrict"] = ParcelModel.getParcelModel().getInspectionDistrict();
		parcel["NoticeConditions"] = ParcelModel.getParcelModel().getNoticeConditions();
		parcel["ImprovedValue"] = ParcelModel.getParcelModel().getImprovedValue();
		parcel["PlanArea"] = ParcelModel.getParcelModel().getPlanArea();
		parcel["Lot"] = ParcelModel.getParcelModel().getLot();
		parcel["ParcelArea"] = ParcelModel.getParcelModel().getParcelArea();
		parcel["Township"] = ParcelModel.getParcelModel().getTownship();
		parcel["LandValue"] = ParcelModel.getParcelModel().getLandValue();

		var tmpAttrList = ParcelModel.getParcelModel().getParcelAttribute();
		for (xx1 in tmpAttrList) {
			parcel[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
		}

		parcelArray.push(parcel);

	}

}

function LoadParcelFromSession(parcelArray) {
	var parcelModel = capModel.getParcelModel();
	if (parcelModel) {
		var parcel = new Array();
		parcel["ParcelNumber"] = parcelModel.getParcelNo();
		parcel["Section"] = parcelModel.getParcelModel().getSection();
		parcel["Block"] = parcelModel.getParcelModel().getBlock();
		parcel["LegalDesc"] = parcelModel.getParcelModel().getLegalDesc();
		parcel["GisSeqNo"] = parcelModel.getParcelModel().getGisSeqNo();
		parcel["SourceSeqNumber"] = parcelModel.getParcelModel().getSourceSeqNumber();
		parcel["Page"] = parcelModel.getParcelModel().getPage();
		parcel["I18NSubdivision"] = parcelModel.getParcelModel().getI18NSubdivision();
		parcel["CouncilDistrict"] = parcelModel.getParcelModel().getCouncilDistrict();
		parcel["RefAddressTypes"] = parcelModel.getParcelModel().getRefAddressTypes();
		parcel["ParcelStatus"] = parcelModel.getParcelModel().getParcelStatus();
		parcel["ExemptValue"] = parcelModel.getParcelModel().getExemptValue();
		parcel["PublicSourceSeqNBR"] = parcelModel.getParcelModel().getPublicSourceSeqNBR();
		parcel["CensusTract"] = parcelModel.getParcelModel().getCensusTract();
		parcel["InspectionDistrict"] = parcelModel.getParcelModel().getInspectionDistrict();
		parcel["NoticeConditions"] = parcelModel.getParcelModel().getNoticeConditions();
		parcel["ImprovedValue"] = parcelModel.getParcelModel().getImprovedValue();
		parcel["PlanArea"] = parcelModel.getParcelModel().getPlanArea();
		parcel["Lot"] = parcelModel.getParcelModel().getLot();
		parcel["ParcelArea"] = parcelModel.getParcelModel().getParcelArea();
		parcel["Township"] = parcelModel.getParcelModel().getTownship();
		parcel["LandValue"] = parcelModel.getParcelModel().getLandValue();

		var tmpAttrList = parcelModel.getParcelModel().getParcelAttribute();
		for (xx1 in tmpAttrList) {
			parcel[tmpAttrList[xx1].attributeName] = tmpAttrList[xx1].attributeValue;
		}
		parcelArray.push(parcel);
	}

}

function createAsitRulesMap(customListsRule) {
	var asitRule = new Array();

	for ( var tc in customListsRule) {
		var tableColumn = tc.split('/');
		var tableName = tableColumn[0];
		var asitColName = tableColumn[1];
		var asitValue = customListsRule[tc];

		if (asitRule[tableName] == null) {
			var ruleArr = new Array();
			ruleArr.push(new asitRuleFieldsObject(asitColName, asitValue))
			asitRule[tableName] = ruleArr;
		} else {
			ruleArr = asitRule[tableName];
			ruleArr.push(new asitRuleFieldsObject(asitColName, asitValue))
			asitRule[tableName] = ruleArr;
		}
	} // for all ASIT rules

	return asitRule;
}

function asitRuleFieldsObject(columnName, fieldValue) {
	this.columnName = columnName;
	this.fieldValue = fieldValue;

	asitRuleFieldsObject.prototype.toString = function() {
		return String(this.fieldValue);
	};
}

//this function to get the Contacts attribute from the session in ACA and AV for ASB EVENT
function getContactsFromSessionForASB() {
	var contactModelList = aa.env.getValue("ContactList");
	if (contactModelList != "") {
		var contactsArray = new Array;
		var contact = new Array;
		for (var i = 0; i < contactModelList.size(); i++) {

			contact["lastName"] = contactModelList.get(i).getPeople().getLastName();
			contact["firstName"] = contactModelList.get(i).getPeople().getFirstName();
			contact["middleName"] = contactModelList.get(i).getPeople().getMiddleName();
			contact["businessName"] = contactModelList.get(i).getPeople().getBusinessName();
			contact["contactSeqNumber"] = contactModelList.get(i).getPeople().getContactSeqNumber();
			contact["contactType"] = contactModelList.get(i).getPeople().getContactType();
			contact["relation"] = contactModelList.get(i).getPeople().getRelation();
			contact["phone1"] = contactModelList.get(i).getPeople().getPhone1();
			contact["phone2"] = contactModelList.get(i).getPeople().getPhone2();
			contact["email"] = contactModelList.get(i).getPeople().getEmail();
			contact["addressLine1"] = contactModelList.get(i).getPeople().getCompactAddress().getAddressLine1();
			contact["addressLine2"] = contactModelList.get(i).getPeople().getCompactAddress().getAddressLine2();
			contact["city"] = contactModelList.get(i).getPeople().getCompactAddress().getCity();
			contact["state"] = contactModelList.get(i).getPeople().getCompactAddress().getState();
			contact["zip"] = contactModelList.get(i).getPeople().getCompactAddress().getZip();
			contact["fax"] = contactModelList.get(i).getPeople().getFax();

			contact["country"] = contactModelList.get(i).getPeople().getCountryCode();
			contact["fullName"] = contactModelList.get(i).getPeople().getFullName();
			contact["peopleModel"] = contactModelList.get(i).getPeople();

			var atts = new Array;
			var attributes = contactModelList.get(i).getPeople().getAttributes();
			if (attributes)
				atts = attributes.toArray()
			for (att in atts)
				contact[atts[att].attributeName] = atts[att].attributeValue;

			contactsArray.push(contact);
		}
	}

	return contactsArray;
}

function getContactsFromSessionAV() {
	var contactModel = aa.env.getValue("Contact");
	var contactModelList = aa.env.getValue("SelectedContactList");
	var contactsArray = new Array;
	var contact = new Array;
	if (contactModelList != "") {

		for (var i = 0; i < contactModelList.size(); i++) {
			contact["lastName"] = contactModelList.get(i).getPeople().getLastName();
			contact["firstName"] = contactModelList.get(i).getPeople().getFirstName();
			contact["middleName"] = contactModelList.get(i).getPeople().getMiddleName();
			contact["businessName"] = contactModelList.get(i).getPeople().getBusinessName();
			contact["contactSeqNumber"] = contactModelList.get(i).getPeople().getContactSeqNumber();
			contact["contactType"] = contactModelList.get(i).getPeople().getContactType();
			contact["relation"] = contactModelList.get(i).getPeople().getRelation();
			contact["phone1"] = contactModelList.get(i).getPeople().getPhone1();
			contact["phone2"] = contactModelList.get(i).getPeople().getPhone2();
			contact["email"] = contactModelList.get(i).getPeople().getEmail();
			contact["addressLine1"] = contactModelList.get(i).getPeople().getCompactAddress().getAddressLine1();
			contact["addressLine2"] = contactModelList.get(i).getPeople().getCompactAddress().getAddressLine2();
			contact["city"] = contactModelList.get(i).getPeople().getCompactAddress().getCity();
			contact["state"] = contactModelList.get(i).getPeople().getCompactAddress().getState();
			contact["zip"] = contactModelList.get(i).getPeople().getCompactAddress().getZip();
			contact["fax"] = contactModelList.get(i).getPeople().getFax();

			contact["country"] = contactModelList.get(i).getPeople().getCountryCode();
			contact["fullName"] = contactModelList.get(i).getPeople().getFullName();
			contact["peopleModel"] = contactModelList.get(i).getPeople();

			var atts = new Array;
			var attributes = contactModelList.get(i).getPeople().getAttributes();
			if (attributes)
				atts = attributes.toArray()
			for (att in atts)
				contact[atts[att].attributeName] = atts[att].attributeValue;

			contactsArray.push(contact);
		}

	} else {
		contact["lastName"] = contactModel.getPeople().getLastName();
		contact["firstName"] = contactModel.getPeople().getFirstName();
		contact["middleName"] = contactModel.getPeople().getMiddleName();
		contact["businessName"] = contactModel.getPeople().getBusinessName();
		contact["contactSeqNumber"] = contactModel.getPeople().getContactSeqNumber();
		contact["contactType"] = contactModel.getPeople().getContactType();
		contact["relation"] = contactModel.getPeople().getRelation();
		contact["phone1"] = contactModel.getPeople().getPhone1();
		contact["phone2"] = contactModel.getPeople().getPhone2();
		contact["email"] = contactModel.getPeople().getEmail();
		contact["addressLine1"] = contactModel.getPeople().getCompactAddress().getAddressLine1();
		contact["addressLine2"] = contactModel.getPeople().getCompactAddress().getAddressLine2();
		contact["city"] = contactModel.getPeople().getCompactAddress().getCity();
		contact["state"] = contactModel.getPeople().getCompactAddress().getState();
		contact["zip"] = contactModel.getPeople().getCompactAddress().getZip();
		contact["fax"] = contactModel.getPeople().getFax();

		contact["country"] = contactModel.getPeople().getCountryCode();
		contact["fullName"] = contactModel.getPeople().getFullName();
		contact["peopleModel"] = contactModel.getPeople();

		var atts = new Array;
		var attributes = contactModel.getPeople().getAttributes();
		if (attributes)
			atts = attributes.toArray()
		for (att in atts)
			contact[atts[att].attributeName] = atts[att].attributeValue;

		contactsArray.push(contact);
	}
	return contactsArray

}

function getContactsFromSession4ACA() {
	var e = capId;
	r = cap.getContactsGroup();
	var contactsArray = new Array;
	if (r.size() > 0) {
		for (var cc = 0; cc < r.size(); cc++) {
			var contact = new Array;
			contact["lastName"] = r.get(cc).getPeople().lastName;
			contact["firstName"] = r.get(cc).getPeople().firstName;
			contact["middleName"] = r.get(cc).getPeople().middleName;
			contact["businessName"] = r.get(cc).getPeople().businessName;
			contact["contactSeqNumber"] = r.get(cc).getPeople().contactSeqNumber;
			contact["contactType"] = r.get(cc).getPeople().contactType;
			contact["relation"] = r.get(cc).getPeople().relation;
			contact["phone1"] = r.get(cc).getPeople().phone1;
			contact["phone2"] = r.get(cc).getPeople().phone2;
			contact["email"] = r.get(cc).getPeople().email;
			contact["addressLine1"] = r.get(cc).getPeople().getCompactAddress().getAddressLine1();
			contact["addressLine2"] = r.get(cc).getPeople().getCompactAddress().getAddressLine2();
			contact["city"] = r.get(cc).getPeople().getCompactAddress().getCity();
			contact["state"] = r.get(cc).getPeople().getCompactAddress().getState();
			contact["zip"] = r.get(cc).getPeople().getCompactAddress().getZip();
			contact["fax"] = r.get(cc).getPeople().getFax();
			contact["country"] = r.get(cc).getPeople().getCountryCode();
			contact["fullName"] = r.get(cc).getPeople().getFullName();
			contact["peopleModel"] = r.get(cc).getPeople();

			var atts = new Array;
			var o = r.get(cc).getPeople().getAttributes();
			if (o)
				atts = o.toArray()
			for (att in atts)
				contact[atts[att].attributeName] = atts[att].attributeValue;

			contactsArray.push(contact);
		}

		return contactsArray
	}
	return false;
}

function getContactsList() {
	var contactArray = getPeople(capId);
	var contactsArray = new Array;
	if (contactArray.length > 0) {
		for (var cc = 0; cc < contactArray.length; cc++) {
			var contact = new Array;
			contact["lastName"] = contactArray[cc].getPeople().lastName;
			contact["firstName"] = contactArray[cc].getPeople().firstName;
			contact["middleName"] = contactArray[cc].getPeople().middleName;
			contact["businessName"] = contactArray[cc].getPeople().businessName;
			contact["contactSeqNumber"] = contactArray[cc].getPeople().contactSeqNumber;
			contact["contactType"] = contactArray[cc].getPeople().contactType;
			contact["relation"] = contactArray[cc].getPeople().relation;
			contact["phone1"] = contactArray[cc].getPeople().phone1;
			contact["phone2"] = contactArray[cc].getPeople().phone2;
			contact["email"] = contactArray[cc].getPeople().email;
			contact["addressLine1"] = contactArray[cc].getPeople().getCompactAddress().getAddressLine1();
			contact["addressLine2"] = contactArray[cc].getPeople().getCompactAddress().getAddressLine2();
			contact["city"] = contactArray[cc].getPeople().getCompactAddress().getCity();
			contact["state"] = contactArray[cc].getPeople().getCompactAddress().getState();
			contact["zip"] = contactArray[cc].getPeople().getCompactAddress().getZip();
			contact["fax"] = contactArray[cc].getPeople().getFax();
			contact["country"] = contactArray[cc].getPeople().getCountryCode();
			contact["fullName"] = contactArray[cc].getPeople().getFullName();
			contact["peopleModel"] = contactArray[cc].getPeople();
			var atts = new Array;
			var o = contactArray[cc].getPeople().getAttributes();
			if (o)
				atts = o.toArray()
			for (att in atts)
				contact[atts[att].attributeName] = atts[att].attributeValue;

			contactsArray.push(contact);
		}
		return contactsArray
	}

	return false;
}

function getFieldValue(fieldName, asiGroups) {
	if (asiGroups == null) {
		return null;
	}

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {
					return field.getChecklistComment();
				}
			}
		}
	}
	return null;
}

function getASITablesRowsFromSession4ACA(tableName) {
	var gm = cap.getAppSpecificTableGroupModel()
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();
		if (tsm.rowIndex.isEmpty())
			continue;

		var asitRow = new Array;
		var asitTables = new Array;
		var tn = tsm.getTableName();
		if (tn != tableName) {
			continue;
		}

		var tsmfldi = tsm.getTableField().iterator();
		var tsmcoli = tsm.getColumns().iterator();
		while (tsmfldi.hasNext()) {

			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();

			asitRow[tcol.getColumnName()] = tval;

			if (!tsmcoli.hasNext()) {
				tsmcoli = tsm.getColumns().iterator();
				asitTables.push(asitRow);
				asitRow = new Array;
			}
		}
		return asitTables;
	}
	return false;
}

function addConditionMultiLanguage(cDescEnglish, cDescArabic) {
	var itemCap = capId;
	if (arguments.length >= 3) {
		itemCap = arguments[2];
	}

	var cType = "Required Document";
	var capCondArr = new Array();
	var enCond = aa.capCondition.getNewConditionScriptModel().getOutput();

	enCond.setResLangId("en_US");
	enCond.setConditionDescription(cDescEnglish);
	enCond.setLongDescripton(cDescEnglish);
	enCond.setResolutionAction("Notice");
	enCond.setPublicDisplayMessage(cDescEnglish);
	enCond.setCapID(itemCap);
	enCond.setConditionStatus("Applied");
	enCond.setConditionType(cType);
	enCond.setDisplayConditionStatusAndType(cType);

	var arCond = aa.capCondition.getNewConditionScriptModel().getOutput();
	arCond.setResLangId("ar_AE");
	arCond.setConditionDescription(cDescArabic);
	arCond.setLongDescripton(cDescArabic);
	arCond.setResolutionAction("Notice");
	arCond.setPublicDisplayMessage(cDescArabic);
	arCond.setCapID(itemCap);
	arCond.setConditionStatus("Applied");
	arCond.setConditionType(cType);
	arCond.setDisplayConditionStatusAndType(cType);
	capCondArr.push(enCond);
	capCondArr.push(arCond);

	var addCapCondResult = aa.condition.createConditionWithMulLangs(capCondArr, enCond);

	if (addCapCondResult.getSuccess()) {
		logDebug("Successfully added condition ", addCapCondResult.getOutput());
	}
}

function removeAllRequiredDocumentCapCondition() {
	var entityModel = aa.proxyInvoker.newInstance("com.accela.v360.document.EntityModel").getOutput();
	entityModel.setServiceProviderCode('ADMA');
	entityModel.setEntityType("TMP_CAP");
	entityModel.setEntityID(capId);

	var documentlist = aa.document.getDocumentListByEntity(capId, 'TMP_CAP').getOutput();
	var documentBiz = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.DocumentBusiness").getOutput();

	for (var d = 0; d < documentlist.size(); d++) {
		var documentItem = documentlist.get(d);
		documentBiz.removeDocument4Partial(entityModel, 'ADMA', documentItem.getDocumentNo());
	}

	// delete conditions
	var result = aa.capCondition.getCapConditions(capId);
	var condMap = {};
	var conditions = {};
	var capConds = result.getOutput();
	for (var i = 0; i < capConds.length; i++) {
		aa.capCondition.deleteCapCondition(capId, capConds[i].getConditionNumber());
	}
}

//// this function to compare address between the JSON and the system(Sesssion or DB)
function isAddressMatchRules(addressJson) {

	if (!addressJson) {
		return true;
	}

	var addrArray = new Array();
	getAddress(addrArray);

	if (!addrArray) {
		return false
	}

	for ( var ct in addressJson) {

		for (ca in addrArray) {
			for (ca in addrArray) {
				var rowMatched = true;

				for ( var ct in addressJson) {
					rowMatched = rowMatched && addressJson[ct].equals(addrArray[ca][ct]);
				} // for address in json

				if (rowMatched) {
					return true;
				}
			} // f
		} // for all address rows

	}

	return false;

}

////this function to compare parcel between the JSON and the system(Sesssion or DB)
function isParcelMatchRules(parcelJson) {

	if (!parcelJson) {
		return true;
	}

	var parcelArray = new Array();
	getParcel(parcelArray);
	if (!parcelArray) {
		return false;
	}

	for ( var ct in parcelJson) {

		for (ca in parcelArray) {
			for (ca in parcelArray) {
				var rowMatched = true;

				for ( var ct in parcelJson) {
					rowMatched = rowMatched && parcelJson[ct].equals(parcelArray[ca][ct]);
				} // for parcel in json

				if (rowMatched) {
					return true;
				}
			} // f
		} // for all parcel rows

	}

	return false;

}

////this function to compare LP between the JSON and the system(Sesssion or DB)
function isLPMatchRules(lpJson) {

	if (!lpJson) {
		return true;
	}

	var lpArray = new Array();
	getLPFields(lpArray);
	if (!lpArray) {
		return false;
	}

	for ( var ct in lpJson) {

		for (ca in lpArray) {
			for (ca in lpArray) {
				var rowMatched = true;

				for ( var ct in lpJson) {
					rowMatched = rowMatched && lpJson[ct].equals(lpArray[ca][ct]);

				} // for lp in json

				if (rowMatched) {
					return true;
				}
			} // f
		} // for all lp rows

	}

	return false;

}

////this function to compare Record Status between the JSON and the system(Sesssion or DB)
function isCapStatusMatchRules(statusJson) {

	if (statusJson == null || statusJson == "")
		return true;
	var isValid = true;
	if (statusJson != getRecordStatus()) {
		isValid = false;
	}
	return isValid;
}

//this function is to get the current cap status if ACA or AV.
function getRecordStatus() {
	var capModel;
	if (isPublicUser && (capId.toString().indexOf("EST") != -1 || (cap != null && cap.getCapClass() == "EDITABLE"))) {
		capModel = aa.env.getValue("CapModel");
		return capModel.getCapStatus();
	} else {
		capModel = aa.cap.getCap(capId).getOutput();
		return capModel.getCapStatus();
	}
}

function isContactMatchRules(contactFieldsJson) {
	//no contact rules in JSON
	if (!contactFieldsJson) {
		return true;
	}

	var contactsArray = getContacts();

	//contacts array is empty
	if (!contactsArray) {
		return false;
	}

	for (ca in contactsArray) {
		var rowMatched = true;

		for ( var ct in contactFieldsJson) {
			rowMatched = rowMatched && contactFieldsJson[ct].equals(contactsArray[ca][ct]);

		} // for contactInfo in json

		if (rowMatched) {
			return true;
		}
	} // for all contact rows

	return false;
}

function isCustomFieldsMatchRules(customFieldsJson) {

	//no contact rules in JSON
	if (!customFieldsJson) {
		return true;
	}

	for ( var cf in customFieldsJson) {
		var recordValue = GetASIValue(cf);
		if (!customFieldsJson[cf].equals(recordValue)) {
			return false;
		}
	}
	return true;
}

function isCustomListsMatchRules(customListsRulesJson) {

	if (!customListsRulesJson) {
		return true;
	}

	var asitRulesMap = createAsitRulesMap(customListsRulesJson);
	var isMatched = true;

	for ( var rm in asitRulesMap) {
		var asiTable = getASITable(rm);
		var tableRules = asitRulesMap[rm];

		for (row in asiTable) {

			//check if all rule fields for an ASITable are matched in one row (from record data)
			isMatched = true; // reset to TRUE for each row
			for (j in tableRules) {
				var tableValue = asiTable[row][tableRules[j].columnName];
				var rulesColumnValue = tableRules[j].fieldValue;

				isMatched = isMatched && (tableValue == rulesColumnValue);
			} // for all tableRule fields

		} // for all rows in record ASIT

		//if (for one of ASITables in rules), all record ASIT rows did not match
		if (!isMatched) {
			return false;
		}

	} // for all asitRulesMap

	return true;
}

/**
 * Compares ONLY (address, contact, customFields,customLists, Parcel and LicensedProfessional) data VS
 * JSON rule item, OTHER RULE fields will not be compared (ex, step, page)
 * @param jsonRuleItem
 * @returns true if all rule types/fields are matched, otherwise false
 */
function isJsonRulesMatchRecordData(jsonRuleItem) {
	var contactInfo = jsonRuleItem.contactFields;
	var customFields = jsonRuleItem.customFields;
	var customLists = jsonRuleItem.customLists;
	var addressInfo = jsonRuleItem.addressFields;
	var lpInfo = jsonRuleItem.lpFields;
	var parcelFields = jsonRuleItem.parcelFields;
	return isContactMatchRules(contactInfo) && isCustomFieldsMatchRules(customFields) && isCustomListsMatchRules(customLists) && isAddressMatchRules(addressInfo)
			&& isParcelMatchRules(parcelFields) && isLPMatchRules(lpInfo);
}

// this function will create invoice for recrod tpye fees
function invoiceFeeCustom(fcode, fperiod) {
	//invoices all assessed fees having fcode and fperiod
	var feeFound = false;
	getFeeResult = aa.finance.getFeeItemsByFeeCodeAndPeriod(capId, fcode, fperiod, "NEW");
	if (getFeeResult.getSuccess()) {
		var feeList = getFeeResult.getOutput();
		for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				feeSeqList.push(feeSeq);
				paymentPeriodList.push(fperiod);
				feeFound = true;
				logDebug("Assessed fee " + fcode + " found and tagged for invoicing");
			}

		if (feeSeqList.length) {
			invoiceResult = aa.finance.createInvoice(capId, feeSeqList, paymentPeriodList);
			if (invoiceResult.getSuccess()) {
				logDebug("Invoicing assessed fee items is successful.");

			}
		}

	} else {
		logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
	}
	return feeFound;
}

/**
 * Handles undefined variables. Set required = true or false.
 * @example If undefined and required = true then return false.
 * 			If undefined and required = false then return an empty string.
 * 			If not undefined, then return the item
 *
 * @param {*} item
 * @param {*} required
 */
function handleUndefined(item, required) {
	if (typeof item == 'undefined' && required) {
		return false;
	}
	if (typeof item == 'undefined' && !required) {
		return '';
	}
	return item;
}

/// --------------------- GIS UTILS Section
function GisUtils(gisServiceId) {
	this.gisBusiness = aa.proxyInvoker.newInstance("com.accela.aa.gis.gis.GISBusiness").getOutput();
	this.parcelBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.parcel.ParcelBusiness").getOutput();
	this.serviceProviderCode = aa.getServiceProviderCode();

	if (gisServiceId != null) {
		this.gisServiceId = gisServiceId;
	} else {
		this.gisServiceId = this.gisBusiness.getDefaultGISServiceID(this.serviceProviderCode, "ADMIN");
	}
}

/**
 * Utility Method to retrieve layer information by the configured object id
 *
 * @param gisLayer : Gis Layer to retrieve its information.
 * @param gisId : Layer Object Id
 * @param mappingIdField : FID or OBJECTID
 * @returns List of Layer attributes
 */
GisUtils.prototype.getGisLayerInfo = function(gisLayer, gisId, mappingIdField) {
	var layerInfoList = null;
	try {
		var gisObjectModel = aa.proxyInvoker.newInstance("com.accela.aa.gis.gis.GISObjectModel").getOutput();
		var gisTypeObj = aa.gis.getGISType(this.gisServiceId, gisLayer).getOutput();

		var gisTypeModel = gisTypeObj.getGISTypeModel();
		var gisObjectModelList = aa.util.newArrayList();
		if (mappingIdField.equalsIgnoreCase("OBJECTID")) {
			gisObjectModel.setGisObjectID(gisId);
		} else if (mappingIdField.equalsIgnoreCase("FID")) {
			gisObjectModel.setGisId(gisId);
		}
		gisObjectModelList.add(gisObjectModel);
		gisTypeModel.setGISObjects(gisObjectModelList);

		var gisObjectAttributes = aa.gis.getGISObjectAttributes(gisTypeObj).getOutput();
		if (gisObjectAttributes != null) {
			var attributes = gisObjectAttributes.getGisObjectModel().getAttributes();
			if (attributes != null && attributes.size() > 0) {
				layerInfoList = attributes.entrySet().toArray();
			}
		}
	} catch (e) {
		aa.debug("Error at GisUtils.getGisLayerInfo, gisId : " + gisId, e);
		throw e;
	}

	return layerInfoList;
}

/**
 * communicates with GIS service and fetch value of attributeName
 * @param serviceId
 * @param layer
 * @param attributeName
 * @param mappingIdField : FID or OBJECTID
 * @param gisId is parcel number
 * @returns value of requested attribute, or false if not exist in GisAttributes array
 */
function getAttrFromGIS(serviceId, layer, attributeName, mappingIdField, gisId) {
	var gisUtil = new GisUtils(serviceId);
	var layerAttributesArray = gisUtil.getGisLayerInfo(layer, gisId, mappingIdField);
	if (layerAttributesArray == null || layerAttributesArray.length == 0) {
		return false;
	}

	for (g in layerAttributesArray) {
		if (layerAttributesArray[g].getKey().equals(attributeName)) {
			return layerAttributesArray[g].getValue();
		}
	} //for gis attrs

	return false;
}
/// --------------------- GIS UTILS Section -- END

/**
 * this function to check the proximity for specific object type
 * @param svc GIS Service
 * @param layer GIS layer
 * @param numDistance distance
 * @param objectType that you need to check if the object type is all or null it will check all GIS objects 
 * else it will check the specific type that you passed.
 * @param distanceType optional param that shows the distance unit.
 * @returns   true if the app has a gis object in proximity
 *  
 */
//Important Note : proximityForGISObject will not work with javascript JS . only with Silverlight and USE_GIS_REST_API should be NO or disabled
function proximityForGISObject(svc, layer, numDistance, objectType) {
	// returns true if the app has a gis object in proximity
	// use with all events except ApplicationSubmitBefore

	var distanceType = "feet"
	if (arguments.length == 4)
		distanceType = arguments[3]; // use distance type in arg list

	var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
	if (bufferTargetResult.getSuccess()) {
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(layer + "_ID");
	} else {
		logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
		return false
	}

	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess())
		var fGisObj = gisObjResult.getOutput();
	else {
		logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
		return false
	}

	for (a1 in fGisObj) // for each GIS object on the Cap
	{
		if (fGisObj[a1].getGisTypeId() == objectType || objectType == null || objectType == "all") {
			var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);
			logDebug("GIS OBJECT Type " + fGisObj[a1].getGisTypeId());

			if (bufchk.getSuccess())
				var proxArr = bufchk.getOutput();
			else {
				logDebug("**WARNING: Retrieving Buffer Check Results. Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
				return false
			}
		} else {
			return false;
		}

		for (a2 in proxArr) {
			var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
			if (proxObj.length) {
				return true;
			}
		}
	}

	return false; // this will return false if the fGisObj for the cap is empty
}

/**
 * creates an Associative Array, with values retrieved from GIS service.
 * @param copyGISData Describes GIS service|layer|attribute and destination field name (JSON Object)
 * @param mappingIdField ID or OBJECTID
 * @param parcelNumber
 * @returns {Associative Array} , KEY is destination field/attribute name, VALUE is the new value (From GIS Service) 
 */
function getNewAttributesMap(copyGISData, mappingIdField, parcelNumber) {
	var atrValuesMap = new Array();
	for (key in copyGISData) {

		var destFieldName = copyGISData[key];

		//[0]: service, [1] layer, [2] attribute
		var keyArray = key.split("|");
		var newValue = getAttrFromGIS(keyArray[0], keyArray[1], keyArray[2], mappingIdField, parcelNumber);

		if (newValue) {
			atrValuesMap[destFieldName] = newValue;
		}
	}//for all copyGisData key Fields
	return atrValuesMap;
}

/**
 * this function to get the related records that linked to the same address that linked to the current cap
 * @param StreetName
 * @param HouseNumberStart
 * @param StreetSuffix
 * @param StreetDirection
 * @returns array of capIdScriptModel
 */
function getRelatedCapsByAddressAttributes(StreetName, HouseNumberStart, StreetSuffix, StreetDirection) {
	var retArr = new Array();

	HouseNumberStart = (HouseNumberStart != "") ? parseInt(HouseNumberStart) : 0;
	capAddResult = aa.cap.getCapListByDetailAddress(StreetName, HouseNumberStart, StreetSuffix, null, StreetDirection, null);
	if (capAddResult.getSuccess()) {
		var capIdArray = capAddResult.getOutput();
	} else {
		logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());
		return false;
	}

	// loop through related caps
	for (cappy in capIdArray) {
		retArr.push(capIdArray[cappy]);

	} // loop through related caps

	if (retArr.length > 0)
		return retArr;

}

/**
 * Copy Assets from capIdFrom to capIdTo
 * @param capIdFrom Source Record
 * @param capIdTo Destination Record
 * @param typesArray types/group names to be copied, null or empty array means ALL
 * @returns true if success, false otherwise
 */
function copyAssetsByType(capIdFrom, capIdTo, typesArray) {

	var isByType = typesArray != null && typesArray.length > 0;

	//clone all
	if (!isByType) {
		var capModelFrom = aa.cap.getCapByPK(capId, true);
		if (!capModelFrom.getSuccess()) {
			return false;
		}
		capModelFrom = capModelFrom.getOutput();
		var cloned = aa.asset.cloneAssets(capModelFrom, capIdTo);
		return cloned.getSuccess();
	}

	var a = aa.asset.getRecordAssetsByRecordId(capIdFrom);//WorkOrderAssetModel
	if (!a.getSuccess()) {
		logDebug("**INFO: Failed to get src Assets: " + r.getErrorMessage());
		return false;
	}
	var assets = a.getOutput();

	for (as in assets) {

		if (isByType) {

			var seqNum = assets[as].getAssetPK().getG1AssetSequenceNumber();
			var assetData = aa.asset.getAssetData(seqNum);
			if (assetData.getSuccess()) {
				assetData = assetData.getOutput(); //array of AssetScriptModel
			} else {
				continue;
			}
			var assetMasterModel = assetData.getAssetMasterModel();//AssetMasterModel
			if (!arrayContainsValue(typesArray, assetMasterModel.getG1AssetType())) {
				continue;
			}
		}

		assets[as].setCapID(capIdTo);
		aa.asset.createWorkOrderAsset(assets[as]);
	}//for all assets
	return true;
}
/**
 * Copy Licensed Professionals from capIdFrom to capIdTo
 * @param capIdFrom Source Record
 * @param capIdTo Destination Record
 * @param typesArray types/group names to be copied, null or empty array means ALL
 * @returns true if success, false otherwise
 */
function copyLicensedProfByType(capIdFrom, capIdTo, typesArray) {
	var n = aa.licenseProfessional.getLicensedProfessionalsByCapID(capIdFrom).getOutput();
	var isByType = typesArray != null && typesArray.length > 0;

	if (n != null)
		for (x in n) {
			if (isByType && !arrayContainsValue(typesArray, n[x].getLicenseType())) {
				continue;
			}//isByType

			n[x].setCapID(capIdTo);
			aa.licenseProfessional.createLicensedProfessional(n[x]);
		}//for all LPs
	else
		logDebug("No licensed professional on source");
	return true;
}
/**
 * Copy Addresses from capIdFrom to capIdTo
 * @param capIdFrom Source Record
 * @param capIdTo Destination Record
 * @param typesArray types/group names to be copied, null or empty array means ALL
 * @returns true if success, false otherwise
 */
function copyAddressesByType(capIdFrom, capIdTo, typesArray) {

	var isByType = typesArray != null && typesArray.length > 0;
	var hasPrimary = false;

	//check if target has any primary addresses
	var i = aa.address.getAddressByCapId(capIdTo);
	if (i.getSuccess()) {
		address = i.getOutput();
		for (yy in address) {
			if ("Y" == address[yy].getPrimaryFlag()) {
				hasPrimary = true;
				break;
			}
		}
	} else {
		logMessage("**INFO: Failed to get dest addresses: " + i.getErrorMessage());
		return false;
	}

	var i = aa.address.getAddressWithAttributeByCapId(capIdFrom);
	if (i.getSuccess()) {
		address = i.getOutput();
		for (yy in address) {
			if (isByType && !arrayContainsValue(typesArray, address[yy].getAddressType())) {
				continue;
			}//isByType

			newAddress = address[yy];
			newAddress.setCapID(capIdTo);
			if (hasPrimary)
				newAddress.setPrimaryFlag("N");
			aa.address.createAddressWithAPOAttribute(capIdTo, newAddress);
		}//for all address
	} else {
		logMessage("**INFO: Failed to get src addresses: " + i.getErrorMessage());
		return false
	}
	return true;
}
/**
 * Copy Conditions from capIdFrom to capIdTo
 * @param capIdFrom Source Record
 * @param capIdTo Destination Record
 * @param typesArray types/group names to be copied, null or empty array means ALL
 * @returns true if success, false otherwise
 */
function copyConditionsByType(capIdFrom, capIdTo, typesArray) {
	
	var isByType = typesArray != null && typesArray.length > 0;
	var isByGroup = conditionGroupsArray != null && conditionGroupsArray.length > 0;
	var n = aa.capCondition.getCapConditions(capIdFrom);
	if (n.getSuccess())
		var r = n.getOutput();
	else {
		logDebug("**INFO: failed getting cap conditions: " + n.getErrorMessage());
		return false;
	}
	for (cc in r) {
		var i = r[cc];

		if (isByType && !arrayContainsValue(typesArray, i.getConditionType())) {
			continue;
		}


		var s = aa.capCondition.addCapCondition(capIdTo, i.getConditionType(), i.getConditionDescription(), i.getConditionComment(), i.getEffectDate(), i.getExpireDate(), aa.date
				.getCurrentDate(), i.getRefNumber1(), i.getRefNumber2(), i.getImpactCode(), i.getIssuedByUser(), i.getStatusByUser(), i.getConditionStatus(), currentUserID,
				String("A"), null, i.getDisplayConditionNotice(), i.getIncludeInConditionName(), i.getIncludeInShortDescription(), i.getInheritable(), i.getLongDescripton(), i
						.getPublicDisplayMessage(), i.getResolutionAction(), null, null, i.getReferenceConditionNumber(), i.getConditionGroup(), i.getDisplayNoticeOnACA(), i
						.getDisplayNoticeOnACAFee(), i.getPriority(), i.getConditionOfApproval());
	}//for all conds
	return true;
}
/**
 * Copy ASI from capIdFrom to capIdTo
 * @param capIdFrom Source Record
 * @param capIdTo Destination Record
 * @param typesArray types/group names to be copied, null or empty array means ALL
 * @returns true if success, false otherwise
 */
function copyAppSpecificByType(capIdFrom, capIdTo, typesArray) {

	//make sure editAppSpecific() works with GROUP_NAME.FIELD_NAME parameter format
	var originalUseAppSpecificGroupName = useAppSpecificGroupName;
	useAppSpecificGroupName = true;

	var isByType = typesArray != null && typesArray.length > 0;
	var asiMGroups = aa.appSpecificInfo.getByCapID(capIdFrom).getOutput();
	for (a in asiMGroups) {
		if (isByType && !arrayContainsValue(typesArray, asiMGroups[a].getCheckboxType())) {
			continue;
		}//byType
		editAppSpecific(asiMGroups[a].getCheckboxType() + "." + asiMGroups[a].getCheckboxDesc(), asiMGroups[a].getChecklistComment(), capIdTo);
	}//for all asiMGroups

	//revert to original value
	useAppSpecificGroupName = originalUseAppSpecificGroupName;
}
/**
 * Copy ASIT from capIdFrom to capIdTo
 * @param capIdFrom Source Record
 * @param capIdTo Destination Record
 * @param typesArray types/group names to be copied, null or empty array means ALL
 * @returns true if success, false otherwise
 */
function copyASITablesByType(capIdFrom, capIdTo, typesArray) {

	var n = capIdFrom;
	var r = aa.appSpecificTableScript.getAppSpecificTableGroupModel(n).getOutput();
	var i = r.getTablesArray();
	var s = i.iterator();
	var o = new Array;
	var isByType = typesArray != null && typesArray.length > 0;
	while (s.hasNext()) {
		var f = s.next();
		var l = new Array;
		var c = new Array;
		var tableName = f.getTableName() + "";
		var p = 0;

		if (isByType && !arrayContainsValue(typesArray, tableName)) {
			continue;
		}//isByType

		if (!f.rowIndex.isEmpty()) {
			var m = f.getTableField().iterator();
			var g = f.getColumns().iterator();
			var y = f.getAppSpecificTableModel().getReadonlyField().iterator();
			while (m.hasNext()) {
				if (!g.hasNext()) {
					var g = f.getColumns().iterator();
					c.push(l);
					var l = new Array();
				}
				var b = g.next();
				var w = m.next();
				var E = "N";
				if (y.hasNext()) {
					E = y.next();
				}
				var S = new asiTableValObj(b.getColumnName(), w, E);
				l[b.getColumnName()] = S
			}
			c.push(l);
		}
		addASITable(tableName, c, capIdTo);
	}//for all ASITs
	return true;
}
/**
 * check if the array contains a value
 * @param ary
 * @param value
 * @returns {Boolean} true if exist, false otherwise
 */
function arrayContainsValue(ary, value) {
	if (ary != null) {
		for (t in ary) {
			if (ary[t] == value) {
				return true;
			}
		}//for all types
	}
	return false;
}
/**
 * check if an array (mostly assoc array) has a key
 * @param ary
 * @param key
 * @returns {Boolean} true if exist, false otherwise
 */
function arrayContainsKey(ary, key) {
	if (ary != null) {
		for (t in ary) {
			if (t == key) {
				return true;
			}
		}//for all types
	}
	return false;
}