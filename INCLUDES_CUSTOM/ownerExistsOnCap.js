function ownerExistsOnCap() {
        // Optional parameter, cap ID to load from
        var itemCap = (arguments.length> 0 && arguments[0]? arguments[0]:capId); // use cap ID if specified in args
        var primaryFlag = (arguments.length> 1 && arguments[1] == true? true:null); // Check if primary owner
 
        var capOwnerResult = aa.owner.getOwnerByCapId(itemCap);
        if (!capOwnerResult.getSuccess())
        { logDebug("**ERROR: Failed to get Owner object: " + capOwnerResult.getErrorMessage()); return false; }
        var owner = capOwnerResult.getOutput();
        for (o in owner) {
                       thisOwner = owner[o];
                       if (owner[o] == null) continue;
                       if (primaryFlag && owner[o].getPrimaryOwner() == "Y") {
                                      return true;
                       } else if (primaryFlag == null) {
                                      return true;
                       }
        }
 
        return false;
 
}
