
function performCISLookup() {
    itemCap = capId;
    if (arguments.length > 0) itemCap = arguments[0];

    dataServiceURL = lookup("CIS Lookup Service", "dataServiceURL");
    if (dataServiceURL && dataServiceURL != "") {
        var capAddrResult = aa.address.getAddressByCapId(itemCap);
        var addressToUse = null;
            
        if (capAddrResult.getSuccess()) {
            var addresses = capAddrResult.getOutput();
            if (addresses) {
                for (zz in addresses) {
                      capAddress = addresses[zz];
                    if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y")) 
                        addressToUse = capAddress;
                }
                if (addressToUse == null)
                    addressToUse = addresses[0];
            }
        }
        if (addressToUse != null) {
            var stName = addressToUse.getStreetName();
            var stType = addressToUse.getStreetSuffix();
            var stNbr = addressToUse.getHouseNumberStart();
            stName = String(stName).replace(/ /g, "%20");
	        stName = String(stName).replace(/,/g, "%2C");
	        var qString = stName+"|"+stType+"|"+stNbr;
            var postresp = aa.util.httpPost( dataServiceURL.replace("$$DATA$$",qString), "PARAMETERSINURL");
            if (postresp.getSuccess()) {
               var tmpResp = postresp.getOutput();
               logDebug("Response: " + tmpResp);    
               respObj = JSON.parse(tmpResp);
               for (var rIndex in respObj) {
                   thisObj = respObj[rIndex];
                   newRow = fillRow(thisObj);
                   addToASITable("CC-UT-UC", newRow);     
               }
            }
            else {
                logDebug("Error : " + postresp.getErrorMessage());
            }
        }
    }
}

function fillRow(o) {
    r = new Array();
    if (o.CustomerNumber && o.CustomerNumber != "")
        r["Customer Number"] = new asiTableValObj("Customer Number", o.CustomerNumber, "N");
    else
        r["Customer Number"] = new asiTableValObj("Customer Number", "", "N");
    if (o.AccountNumber && o.AccountNumber != "")
        r["Account Number"] = new asiTableValObj("Account Number", o.AccountNumber, "N");
    else
        r["Account Number"] = new asiTableValObj("Account Number", "", "N");
    if (o.Address && o.Address != "")
        r["Address"] = new asiTableValObj("Address", o.Address, "N");
    else
        r["Address"] = new asiTableValObj("Address", "", "N");  
    if (o.Cycle && o.Cycle != "")
        r["Cycle"] = new asiTableValObj("Cycle", o.Cycle, "N");
    else
        r["Cycle"] = new asiTableValObj("Cycle", "", "N");
    if (o.Route && o.Route != "")
        r["Route"] = new asiTableValObj("Route", o.Route, "N");
    else
        r["Route"] = new asiTableValObj("Route", "", "N");    
    if (o.Water && o.Water != "")
        r["Water"] = new asiTableValObj("Water", o.Water, "N");
    else
        r["Water"] = new asiTableValObj("Water", "", "N");    
    if (o.Sewer && o.Sewer != "")
        r["Sewer"] = new asiTableValObj("Sewer", o.Sewer, "N");
    else
        r["Sewer"] = new asiTableValObj("Sewer", "", "N");    
    if (o.Irrigation && o.Irrigation != "")
        r["Irrigation"] = new asiTableValObj("Irrigation", o.Irrigation, "N");
    else
        r["Irrigation"] = new asiTableValObj("Irrigation", "", "N");  
    if (o.Classification && o.Classification != "")
        r["Classification"] = new asiTableValObj("Classification", o.Classification, "N");
    else
        r["Classification"] = new asiTableValObj("Classification", "", "N"); 
    if (o.TenantName && o.TenantName != "")
        r["Tenant Name"] = new asiTableValObj("Tenant Name", o.TenantName, "N");
    else
        r["Tenant Name"] = new asiTableValObj("Tenant Name", "", "N");      
    if (o.TenantMailing && o.TenantMailing != "")
        r["Tenant Mailing"] = new asiTableValObj("Tenant Mailing", o.TenantMailing, "N");
    else
        r["Tenant Mailing"] = new asiTableValObj("Tenant Mailing", "", "N"); 
    if (o.OwnerAddress && o.OwnerAddress != "")
        r["Owner  ddress"] = new asiTableValObj("Owner Address", o.OwnerAddress, "N");
    else
        r["Owner Address"] = new asiTableValObj("Owner Address", "", "N");      
    if (o.WaterService && o.WaterService != "")
        r["Water Service"] = new asiTableValObj("Water Service", o.WaterService, "N");
    else
        r["Water Service"] = new asiTableValObj("Water Service", "", "N");  
    return r;                    

}
function soapRespObj(){
    this.isErr = false; //true if soap Error
    this.respObj = null; //response object
    this.errorMessage = ""; //should be popualted if true;
};

function rowObj(rObj) {
    this.accountNumber = rObj.a::AccountNumber.toString();
    this.address = rObj.a::Address.toString();
    this.classification = rObj.a::Classification.toString();
    this.customerNumber = rObj.a::CustomerNumber.toString();
    this.cycle = rObj.a::Cycle.toString();
    this.irrigation =  rObj.a::Irrigation.toString();
    this.route =  rObj.a::Route.toString();
    this.sewer =  rObj.a::Sewer.toString();
    this.water =  rObj.a::Water.toString();
}
