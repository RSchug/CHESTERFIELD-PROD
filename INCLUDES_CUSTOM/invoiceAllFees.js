function invoiceAllFees(capid) {
    var itemCap = capid;
    var targetFees = loadFees(itemCap);
    var feeSeqArray = new Array();
    var paymentPeriodArray = new Array();
    for (tFeeNum in targetFees) {
        targetFee = targetFees[tFeeNum];
        if (targetFee.status == "NEW") {
            feeSeqArray.push(targetFee.sequence);
            paymentPeriodArray.push(targetFee.period);

        }
    }
    var invoicingResult = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);
    if (!invoicingResult.getSuccess()) {
        logDebug("**ERROR: Invoicing fee items not successful.  Reason: " + invoicingResult.getErrorMessage());
        return false;
    }
}