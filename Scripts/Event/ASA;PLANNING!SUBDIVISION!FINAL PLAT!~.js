//When Final Plat Record is submitted add a child Sureties Record.
try {
	if (!publicUser) {
		createChildLic("EnvEngineering","Sureties","Performance","NA",""); 
	}
} catch (err) {
    logDebug("A JavaScript Error occurred: " + err.message + " In Line " + err.lineNumber + " of " + err.fileName + " Stack " + err.stack);
}