/**
 * Calculates the fee CC-BLD-MIXEDUSE.CC_GEN_131
 * Past due reinspection fee penalty the greater of 10% or $10.00. ****
 *
 * Look for invoiced and unpaid fees CC-BLD-G-013 with invoice date older 
 * than DUE_DAYS add the 10% of the sum of the unpaid fees or $10 if the 10% is less than $10.
 * 
 * @return null
 */
function calcFee_CC_BLD_MIXEDUSE_CC_GEN_131() {

	//fee variables
	var fcode = "CC_GEN_131";
	var fsched = "CC-BLD-MIXEDUSE";
	var fperiod = "FINAL";
	var fqty = 10.00;
	var finvoice = "N";
    var fcodeSearchFor = "CC-BLD-G-013";
    var fschedSearchFor = "CC-BLD-GENERAL";

	try {
        // get the ASI field needed for the fee calculation.
        var feeTermsDueDays = lookup("INSPECTION_FEE_TERMS", "DUE_DAYS");
        if (!feeTermsDueDays) feeTermsDueDays = 30; // default due days if none was defined.

        // check if any of the related fees is already assessed and paid.
        var feeArray = loadFees();
        var totalAmount = 0;

        for (f in feeArray) {
            fee = feeArray[f];

            if (fee.code.toUpperCase().equals(fcodeSearchFor) && fee.sched.toUpperCase().equals(fschedSearchFor) && fee.status.toUpperCase().equals("INVOICED") &&
                dateDiff(sysDate, fee.applyDate) >= feeTermsDueDays && (fee.amountPaid == 0.00 || fee.amountPaid < fee.amount)) {
                totalAmount += fee.amount;
                logDebug("Apply Date: " + fee.applyDate);
                logDebug("Amount: " + currencyFormat(fee.amount));
                logDebug("Amount Paid: " + currencyFormat(fee.amountPaid));
            }
        }
                
        // calculation code here.
        if (totalAmount * 0.10 > 10.00) fqty = totalAmount * 0.10;

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
