/**
 * Calculates the fee CC-PLN-SUB.CC-PLN-SFP08
 * BMP Maintenance Fee.
 * $100 per lot recorded. Use CC-PLN-FP.CC-LU-PRSTATS.Lots recorded field value.
 *  
 * @return null
 */
function calcFee_CC_PLN_SUB_CC_PLN_SFP08() {

	//fee variables
	var fcode = "CC-PLN-SFP08";
	var fsched = "CC-PLN-SUB";
	var fperiod = "FINAL";
	var fqty = 100.00;
	var finvoice = "N";

	try {
		// get the ASI field needed for the fee calculation.
		var value = AInfo["Lots recorded"];
		if (!value) {
			logDebug("You need the Lots recorded to assess fee.");
			return null;
		}
		
		value = parseFloat(value);

		// calculation code here.
		var minimumFee = fqty;
		var calculatedFee = minimumFee;

		if (value > 1.00) {
			calculatedFee = minimumFee + ((value - 1) * 70.00);
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
