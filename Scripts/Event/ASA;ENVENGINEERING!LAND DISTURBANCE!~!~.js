//When Land Disturbance Record is submitted add a child Sureties Record.
try {
	if (!publicUser) {
		var newCapId = createChildLic("EnvEngineering","Sureties","ESC","NA",""); 
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}