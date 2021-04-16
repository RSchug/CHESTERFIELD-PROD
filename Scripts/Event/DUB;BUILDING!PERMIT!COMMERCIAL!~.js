try {
	if (publicUser && matches(capStatus,'In Review','Pending Certificate','CO Issued','Partial CO Issued','Completed')) {
		cancel = true;
		showMessage = true;
		comment("<B><font color='red'>Error: You cannot upload a document when the record is " + capStatus + ".</B></font>");
    }
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}