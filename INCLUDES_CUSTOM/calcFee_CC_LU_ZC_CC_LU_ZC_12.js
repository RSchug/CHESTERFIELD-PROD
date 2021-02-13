/**
 * Calculates the fee CC-LU-ZC.CC-LU-ZC-12
 * Conditional use - All others $1400 plus $70 per acre in excess of 1 acre
 * 
 * @return null
 */
function calcFee_CC_LU_ZC_CC_LU_ZC_12() {

	//fee variables
	var fcode = "CC-LU-ZC-12";
	var fsched = "CC-LU-ZC";
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
