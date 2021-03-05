try {
//if (publicUser) and payment received update status to Payment Received
	if (publicUser && (capStatus == 'Payment Due') && (balanceDue == 0)) {
		updateAppStatus("Payment Received","Updated based on payment.");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}