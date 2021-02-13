function doScriptActions() {
	// Modified from INCLUDES_ACCELA_FUNCTIONS
    include(prefix + ":" + "*/*/*/*");
    if (typeof(appTypeArray) == "object") {
        include(prefix + ":" + appTypeArray[0] + "/*/*/*");
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
        include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
        include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
        include(prefix + ":" + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
        include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
    }
    if (typeof(sendDebugEmail) == "undefined") {
        sendDebugEmail = false;
        debugEmailAddress = "";
    }
    if (debug && sendDebugEmail && debugEmailAddress != "")
        aa.sendMail(sysFromEmail, debugEmailAddress, "", "DEBUG-SUPP: " + prefix, debug);
}
