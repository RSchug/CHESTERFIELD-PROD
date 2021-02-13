/**
 * Calculates the fee CC-PLN-SITE.CC-PLN-SIT01
 * Site plan - Initial Submittal $1400 plus $70 per acre in access of 1 acre
 *  
 * @return null
 */
function calcFee_CC_PLN_SITE_CC_PLN_SIT01() {

	//fee variables
	var fcode = "CC-PLN-SIT01";
	var fsched = "CC-PLN-SITE";
	var fperiod = "FINAL";
	var fqty = 1400.00;
	var finvoice = "N";

	try {
		var totalAcreage = AInfo["Total acreage"];
		if (!totalAcreage) {
			logDebug("You need the Total acreage to assess fee.");
			return null;
		}
		
		totalAcreage = parseFloat(totalAcreage);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (totalAcreage > 1.00) {
			calculatedFee = minimumFee + ((totalAcreage - 1) * 70.00);
		}

		fqty = calculatedFee;

		// check if the fee is already added.
		if (feeExists(fcode)) {
			updateFee(fcode, fsched, fperiod, fqty, finvoice);
		} else {
			addFee(fcode, fsched, fperiod, fqty, finvoice);
		}

	} catch (err) {
		logDebug("A JavaScript Error occured: " + arguments.callee.toString().match(/function ([^\(]+)/)[1] + " - " + err.message);
	}
}
