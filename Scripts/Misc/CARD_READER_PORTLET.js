/*------------------------------------------------------------------------------------------------------/
| Program		: CARD_READER_PORTLET.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: YTITI
| Created at	: 27/12/2017 14:09:14
|
/------------------------------------------------------------------------------------------------------*/
var action = param("action", true);
var infoLog = [];
var warningLog = [];
var errorLog = [];
try {
	var content = eval("cmd_" + action + "()");
	aa.env.setValue("success", true);
	aa.env.setValue("message", action + " executed successfully");
	if (content) {
		aa.env.setValue("content", buildResultStructure(content));
	} else {
		aa.env.setValue("content", "");
	}
	aa.env.setValue("ScriptReturnCode", "0");
} catch (e) {
	aa.print(e);
	aa.env.setValue("success", false);
	aa.env.setValue("message", String(e));
	aa.env.setValue("ScriptReturnCode", "-1");
}

function param(param, isRequired) {
	var val = aa.env.getValue(param);
	if (!val || String(val) == "") {
		if (isRequired) {
			throw "Missing required parameter " + param;
		}
		val = "";
	}
	return val;
}

function cmd_getUnpaidRecords() {
	var outputArr = [];

	var result = getUnPaidInvoicesFromDB(1);

	var chesterfieldURL = "https://avsupp3.accela.com/portlets/reports/adHocReport.do?mode=deepLink&reportCommand=recordDetail&altID=";

	if (result.getSuccess()) {
		result = result.getOutput();
		var i = 0;
		if (result.size() > 0 && result.get(0)) {

			while (i < result.size()) {
				var recordObj = {};
				recordObj["capId"] = result.get(i).get("CAPID");
				recordObj["altId"] = result.get(i).get("B1_ALT_ID");
				recordObj["buisnessName"] = result.get(i).get("BUSINESSNAME");
				recordObj["recordTypeAlias"] = result.get(i).get("B1_APP_TYPE_ALIAS");
				recordObj["recordURL"] = chesterfieldURL + result.get(i).get("B1_ALT_ID");
				recordObj["FeeDesc"] = result.get(i).get("FEEDESC");
				recordObj["FeeAmount"] = result.get(i).get("AMT");
				recordObj["InvoiceDate"] = result.get(i).get("INVOICEDATE");
				recordObj["InvoiceNumber"] = result.get(i).get("INVOICE_NBR");
				outputArr.push(recordObj);
				i = i + 1;
			}
		}
	}
	return outputArr;
}

function getUnPaidInvoicesFromDB(count) {

	var query = "select B.B1_ALT_ID, sum(AUD.GF_FEE) AMT, CONCAT(B3C.B1_per_id1, '-' , B3C.b1_per_id2, '-' , B3C.b1_per_id3) CapId, B3C.B1_BUS_NAME BusinessName, B.B1_APP_TYPE_ALIAS, STRING_AGG(AUD.GF_Des, ',') Within GROUP (ORDER BY AUD.INVOICE_NBR) FeeDesc, CONVERT(datetime,INV.INVOICE_DATE,101) InvoiceDate, AUD.INVOICE_NBR from dbo.B1PERMIT B left outer join dbo.B3CONTRA B3C on B.SERV_PROV_CODE = B3C.SERV_PROV_CODE AND B.B1_PER_ID1 = B3C.B1_PER_ID1 AND B.B1_PER_ID2 = B3C.B1_PER_ID2 AND B.B1_PER_ID3 = B3C.B1_PER_ID3 and B3C.B1_LICENSE_NBR in (select top(1) case when D.B1_PRINT_FLAG = 'Y' then D.B1_LICENSE_NBR else C.B1_LICENSE_NBR end from dbo.B3CONTRA C join dbo.B3CONTRA D on C.SERV_PROV_CODE = D.SERV_PROV_CODE AND C.B1_PER_ID1 = D.B1_PER_ID1 AND C.B1_PER_ID2 = D.B1_PER_ID2 AND C.B1_PER_ID3 = D.B1_PER_ID3 AND D.B1_PRINT_FLAG = 'Y' where C.SERV_PROV_CODE = B3C.SERV_PROV_CODE AND C.B1_PER_ID1 = B3C.B1_PER_ID1 AND C.B1_PER_ID2 = B3C.B1_PER_ID2 AND C.B1_PER_ID3 = B3C.B1_PER_ID3 ) "
			+ "inner join dbo.ACCOUNTING_AUDIT_TRAIL AUD on B.SERV_PROV_CODE = AUD.SERV_PROV_CODE AND B.B1_PER_ID1 = AUD.B1_PER_ID1 AND B.B1_PER_ID2 = AUD.B1_PER_ID2 AND B.B1_PER_ID3 = AUD.B1_PER_ID3 and AUD.ACTION = 'Invoice FeeItem' "
			+ "inner join dbo.F4INVOICE INV on INV.SERV_PROV_CODE = AUD.SERV_PROV_CODE and INV.INVOICE_NBR = AUD.INVOICE_NBR and INV.BALANCE_DUE <> 0 "
			+ "where B.SERV_PROV_CODE = 'CHESTERFIELD' "
			+ "group by B.B1_ALT_ID, B3C.SERV_PROV_CODE, B3C.B1_PER_ID1, B3C.B1_PER_ID2, B3C.B1_PER_ID3, CONCAT(B3C.B1_per_id1, '-' , B3C.b1_per_id2, '-' , B3C.b1_per_id3) , B3C.B1_BUS_NAME , B.B1_APP_TYPE_ALIAS, INV.INVOICE_DATE, AUD.INVOICE_NBR "

	result = aa.util.select("jetspeed", query, null);
	if (!result.getSuccess() && count <= 5)
		getUnPaidInvoicesFromDB(count + 1);
	return result;

}

///OLD ONE 
//function cmd_getUnpaidRecords() {
//	var outputArr = [];
//	var unpaidInvoices = aa.invoice.getUnpaidInvoices();
//
//	if (!unpaidInvoices.getSuccess()) {
//		throw unpaidInvoices.getErrorMessage();
//	}
//	unpaidInvoices = unpaidInvoices.getOutput();
//	var capIds = "";
//	for (var i = 0; i < unpaidInvoices.length; i++) {
//		var invoiceModel = unpaidInvoices[i].getInvoiceModel();
//
//		// Get invoice Cap ID
//		var feeItems = aa.invoice.getFeeItemInvoiceByInvoiceNbr(invoiceModel.getInvNbr());
//		if (!feeItems.getSuccess()) {
//			throw feeItems.getErrorMessage();
//		}
//		var feeItems = feeItems.getOutput();
//		if (feeItems.length == 0) {
//			continue;
//		}
//
//		var chesterfieldURL = "https://avsupp3.accela.com/portlets/reports/adHocReport.do?mode=deepLink&reportCommand=recordDetail&altID=";
//		var recordObj = {};
//		var capId = feeItems[0].getCapID();
//		var cap = aa.cap.getCap(capId).getOutput();
//		var recordTypeAlias = cap.getCapModel().getAppTypeAlias();
//		if (capIds.indexOf(capIds) != -1) {
//			isCapExists = false;
//		}
//		if (isCapExists)
//			capIds += "'" + capIDs[i] + "',";
//		//var BusinessName = (cap.getCapModel().getLicenseProfessionalModel().getBusinessName() == null) ? "" : cap.getCapModel().getLicenseProfessionalModel().getBusinessName();
//
//		var BusinessName = "";
//		if (String(cap.getCapModel().getAltID()) == "16CAP-00000034") {
//			var LPList = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId).getOutput();
//			for ( var i in LPList) {
//				if (LPList[i].getPrintFlag() == "Y") {
//					BusinessName = (LPList[i].getBusinessName() == null) ? "" : LPList[i].getBusinessName();
//					break;
//				}
//			}
//		}
//
//		recordObj["capId"] = String(capId);
//		recordObj["altId"] = cap.getCapModel().getAltID();
//		recordObj["buisnessName"] = BusinessName;
//		recordObj["recordTypeAlias"] = recordTypeAlias;
//		recordObj["recordURL"] = chesterfieldURL + cap.getCapModel().getAltID();
//		recordObj["feeItems"] = [];
//		var totalFees = 0;
//
//		for (var w = 0; w < feeItems.length; w++) {
//			if (feeItems[w].getFeeitemStatus() != "INVOICED") {
//				continue;
//			}
//			var feeItemObj = {
//				"feeCode" : feeItems[w].getFeeCode(),
//				"feeDescription" : feeItems[w].getFeeDescription(),
//				"feeUnit" : feeItems[w].getUnit(),
//				"userDescription" : feeItems[w].getUserDescription(),
//				"fee" : feeItems[w].getFee(),
//				"feeItemStatus" : feeItems[w].getFeeitemStatus()
//
//			};
//			totalFees += feeItems[w].getFee();
//			recordObj["feeItems"].push(feeItemObj);
//		}
//		recordObj["totalFee"] = totalFees;
//		outputArr.push(recordObj);
//	}
//	
//	
//
//	// execute Query 
//	/// re check on the output array with the db result and update the business name
//
//	return outputArr;
//}
function cmd_applyPayment() {
	var paidCapIds = param("capIds", true);
	var ssoToken = param("ssoToken", true);
	var cashierId = getUserFromToken(ssoToken);
	for (var i = 0; i < paidCapIds.length; i++) {
		makePaymentForCap(paidCapIds[i], cashierId);
	}
}

function getUserFromToken(token) {
	var ssoSystemId = com.accela.util.AVProperties.getProperty("sso.system.id");
	var appServer = com.accela.util.AVProperties.getProperty("java.naming.provider.url");
	var ssoDomain = "AC360Agency";
	var sAuthClient = new com.accela.security.client.SecurityAuthenticationClient(appServer);
	var userSession = sAuthClient.authenticate(ssoSystemId, token, aa.util.newHashMap());
	return userSession.getUserId();
}

function getCapIdObject(capIdStr) {
	var arr = capIdStr.split("-");
	return aa.cap.getCapID(arr[0], arr[1], arr[2]).getOutput();
}

function makePaymentForCap(capIdString, cashierId) {
	var capId = getCapIdObject(capIdString);
	var feeItems = getFeeItemsByCapId(capId);
	var paymentAmount = aa.cashier.getTotalFeeAmount(capId).getOutput();

	var payment = makePayment(capId, paymentAmount, cashierId);
	applyPaymentForCap(capId, feeItems, payment);

	return true;
}

function applyPaymentForCap(capId, feeItems, payment) {
	var paidFeesOut = getPaidFeeItems(capId);
	var paidFees = {};
	for (var index = 0; index < paidFeesOut.length; index++) {
		if (paidFeesOut[index].getFeeAllocation() == 0) {
			continue;
		}
		var feeSeqNumber = paidFeesOut[index].getFeeSeqNbr();
		// If there is two payments on the same fee items make sure to
		// consolidate them
		if (paidFees[feeSeqNumber]) {
			paidFees[feeSeqNumber] += paidFeesOut[index].getFeeAllocation();
		} else {
			paidFees[feeSeqNumber] = paidFeesOut[index].getFeeAllocation();
		}
	}
	// Sort ascending
	feeItems.sort(function(a, b) {
		return a.getFeeSeqNbr() - b.getFeeSeqNbr();
	});
	// Fee items to pay
	// Fee amount we are paying
	// Invoice number the fee belongs to
	var feeItemsArr = [];
	var feeAllocArr = [];
	var invoicesArr = [];

	for (var i = 0; i < feeItems.length; i++) {
		var feeSequenceNumber = feeItems[i].getFeeSeqNbr();
		var feeAmount = feeItems[i].getFee();
		var feeItemStatus = feeItems[i].getFeeitemStatus();
		var feeInvoiceNumber = feeItems[i].getInvoiceNbr();
		// If there is a paid fee subtract it from this fee
		if (paidFees[feeSequenceNumber]) {
			feeAmount = feeAmount - paidFees[feeSequenceNumber];
		}
		// if the fee amount is 0 (will mostly happen in case the paid
		// amount in full)
		// or if the fee item status is not INVOICED
		// then we skip this item
		if (feeAmount <= 0 || feeItemStatus != "INVOICED") {
			continue;
		}

		feeItemsArr.push(feeSequenceNumber);
		invoicesArr.push(feeInvoiceNumber);
		feeAllocArr.push(feeAmount);

		// Update paid fees
		if (paidFees[feeSequenceNumber]) {
			paidFees[feeSequenceNumber] = paidFees[feeSequenceNumber] + feeAmount;
		} else {
			paidFees[feeSequenceNumber] = feeAmount;
		}
	}
	var applyResult = aa.finance.applyPayment(capId, payment, feeItemsArr, invoicesArr, feeAllocArr, "Paid", "Paid", "0");
	if (!applyResult.getSuccess()) {
		throw applyResult.getErrorMessage();
	}

	// Execute payment received after
	var capIdArr = String(payment.getCapID()).split("-");
	var table = aa.util.newHashtable();
	table.put("FeeItemsList", arrayToString(feeItems.map(function(obj) {
		return obj.getFeeSeqNbr();
	})));
	table.put("FeeItemsPaidList", arrayToString(feeItems.map(function(obj) {
		if (paidFees[obj.getFeeSeqNbr()]) {
			return paidFees[obj.getFeeSeqNbr()];
		} else {
			return 0;
		}
	})));
	table.put("FeePeriod", arrayToString(feeItems.map(function(obj) {
		return obj.getPaymentPeriod();
	})));
	table.put("NumberOfFeeItems", String(feeItems.length));
	table.put("PaymentCashierId", payment.getCashierID());
	table.put("PaymentComment", payment.getPaymentComment());
	table.put("PaymentDate", formatDate(payment.getPaymentDate()));
	table.put("PaymentMethod", payment.getPaymentMethod());
	table.put("PaymentTotalAvailableAmount", 0);
	table.put("PaymentTotalPaidAmount", payment.getPaymentAmount());
	table.put("CurrentUserID", payment.getCashierID());
	if (capIdArr.length == 3) {
		table.put("PermitId1", capIdArr[0]);
		table.put("PermitId2", capIdArr[1]);
		table.put("PermitId3", capIdArr[2]);
	}
	var emseBusiness = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	emseBusiness.handleEvent("PaymentReceiveAfter", aa.getServiceProviderCode(), table, "ADMIN");
}

function getFeeItemsByCapId(capId) {
	var feeItems = aa.finance.getFeeItemInvoiceByCapID(capId, null);
	if (!feeItems.getSuccess()) {
		throw feeItems.getErrorMessage();
	}
	return feeItems.getOutput();
}

function getFeeItemsByInvoice(invoiceNumber) {
	var invoiceFeeItems = aa.invoice.getFeeItemInvoiceByInvoiceNbr(invoiceNumber);
	if (!invoiceFeeItems.getSuccess()) {
		throw invoiceFeeItems.getErrorMessage();
	}
	return invoiceFeeItems.getOutput();
}

function getPaidFeeItems(capId) {
	var paidFeeItems = aa.finance.getPaymentFeeItems(capId, null);
	if (!paidFeeItems.getSuccess()) {
		throw paidFeeItems.getErrorMessage();
	}
	return paidFeeItems.getOutput();
}

function getInvoice(capId, invoiceNumber) {
	var invoice = aa.cashier.getInvoice(capId, invoiceNumber);
	if (!invoice.getSuccess()) {
		throw invoice.getErrorMessage();
	}
	return invoice.getOutput();
}

function makePayment(capId, paymentAmount, cashierId) {
	var paymentModel = aa.finance.createPaymentScriptModel();
	paymentModel.setAuditDate(aa.date.getCurrentDate());
	paymentModel.setAuditStatus("A");
	paymentModel.setCapID(capId);
	paymentModel.setCashierID(cashierId);
	paymentModel.setPaymentSeqNbr(paymentModel.getPaymentSeqNbr());
	paymentModel.setPaymentAmount(paymentAmount);
	paymentModel.setAmountNotAllocated(paymentAmount);
	paymentModel.setPaymentChange(0);
	paymentModel.setPaymentComment("Paid Through Portlet Card Reader");
	paymentModel.setPaymentDate(aa.date.getCurrentDate());
	paymentModel.setPaymentMethod("Elavon Card Reader");
	paymentModel.setPaymentStatus("Paid");
	var paymentSequenceNumber = aa.finance.makePayment(paymentModel);
	if (!paymentSequenceNumber.getSuccess()) {
		throw paymentSequenceNumber.getErrorMessage();
	}
	var paymentSequenceNumber = paymentSequenceNumber.getOutput();

	var payment = aa.finance.getPaymentByPK(capId, paymentSequenceNumber, "ADMIN");
	if (!payment.getSuccess()) {
		throw payment.getErrorMessage();
	}
	return payment.getOutput();
}

function arrayToString(arr) {
	return "[" + (arr ? arr.join("|") : "") + "]";
}

function formatDate(date) {
	if (date.getClass()) {
		if (date.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime")) {
			return date.getYear() + "-" + (date.getMonth() < 10 ? "0" : "") + date.getMonth() + "-" + (date.getDayOfMonth() < 10 ? "0" : "") + date.getDayOfMonth();
		} else if (date.getClass().toString().equals("class java.sql.Timestamp")) {
			return (date.getYear() + 1900) + "-" + (date.getMonth() < 10 ? "0" : "") + date.getMonth() + "-" + (date.getDate() < 10 ? "0" : "") + date.getDate();
		}
	}
	return "";
}

function arrayToString(arr) {
	return "[" + (arr ? arr.join("|") : "") + "]";
}
// returns the result as proper JSON structure when called by construct API
function buildResultStructure(value) {
	if (value) {
		if (Object.prototype.toString.call(value) == "[object Object]") {
			value = buildObjectStructure(value);
		} else if (Object.prototype.toString.call(value) === '[object Array]') {
			value = buildArrayStructure(value);
		}
	}
	return value;
}

function buildObjectStructure(obj) {
	var table = aa.util.newHashMap();
	for ( var p in obj) {
		if (obj.hasOwnProperty(p)) {
			var value = obj[p];
			table.put(obj[p], buildResultStructure(value));
		}
	}
	return obj;
}

function buildArrayStructure(arr) {
	var arrList = aa.util.newArrayList();
	for (var i = 0; i < arr.length; i++) {
		arrList.add(buildResultStructure(arr[i]));
	}
	return arrList;
}

function stringifyJSType(value) {
	if (value) {
		// Java object
		if (value.getClass) {
			value = String(value);
		} else if (typeof value == "object") {
			value = stringifyObject(value);
		} else if (Object.prototype.toString.call(value) === '[object Array]') {
			value = stringifyArray(value);
		}
	}
	return value;
}

function stringifyObject(obj) {
	for ( var p in obj) {
		if (obj.hasOwnProperty(p)) {
			var value = obj[p];
			// get Java objects toString representation
			obj[p] = stringifyJSType(value);
		}
	}
	return obj;
}

function stringifyArray(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i] = stringifyJSType(arr[i]);
	}
}

function getPeople(capId)

{

	capPeopleArr = null;

	var s_result = aa.people.getCapContactByCapID(capId);

	if (s_result.getSuccess())

	{

		capPeopleArr = s_result.getOutput();

		if (capPeopleArr != null || capPeopleArr.length > 0)

		{

			for (loopk in capPeopleArr)

			{

				var capContactScriptModel = capPeopleArr[loopk];

				var capContactModel = capContactScriptModel.getCapContactModel();

				var peopleModel = capContactScriptModel.getPeople();

				var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);

				if (contactAddressrs.getSuccess())

				{

					//var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());

					//peopleModel.setContactAddressList(contactAddressModelArr);

				}

			}

		}

		else

		{

			aa.print("WARNING: no People on this CAP:" + capId);

			capPeopleArr = null;

		}

	}

	else

	{

		aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());

		capPeopleArr = null;

	}

	return capPeopleArr;

}

