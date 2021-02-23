//When Final Plat Record is submitted add a child Sureties Record.
try {
	if (!publicUser) {
		createChild("EnvEngineering","Sureties","NA","NA","");
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}