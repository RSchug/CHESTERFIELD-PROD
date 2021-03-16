function createChildLic(grp, typ, stype, cat, desc)
// creates the new application and returns the capID object - updated 11/2020 for LP's
{
    try {
        var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
        logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
        if (appCreateResult.getSuccess()) {
            var newId = appCreateResult.getOutput();
            logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

            // create Detail Record
            capModel = aa.cap.newCapScriptModel().getOutput();
            capDetailModel = capModel.getCapModel().getCapDetailModel();
            capDetailModel.setCapID(newId);
            aa.cap.createCapDetail(capDetailModel);

            var newObj = aa.cap.getCap(newId).getOutput(); //Cap object
            var result = aa.cap.createAppHierarchy(capId, newId);
            if (result.getSuccess())
                logDebug("Child application successfully linked");
            else
                logDebug("Could not link applications");

            // Copy Parcels
            var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
            if (capParcelResult.getSuccess()) {
                var Parcels = capParcelResult.getOutput().toArray();
                for (zz in Parcels) {
                    logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                    var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                    newCapParcel.setParcelModel(Parcels[zz]);
                    newCapParcel.setCapIDModel(newId);
                    newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                    newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                    aa.parcel.createCapParcel(newCapParcel);
                }
            }

            // Copy Contacts
            capContactResult = aa.people.getCapContactByCapID(capId);
            if (capContactResult.getSuccess()) {
                Contacts = capContactResult.getOutput();
                for (yy in Contacts) {
                    var newContact = Contacts[yy].getCapContactModel();
                    newContact.setCapID(newId);
                    //aa.people.createCapContact(newContact);
                    //this line will also copy attributes
                    aa.people.createCapContactWithAttribute(newContact);
                    logDebug("added contact and attributes");
                }
            }

            // Copy Addresses
            capAddressResult = aa.address.getAddressByCapId(capId);
            if (capAddressResult.getSuccess()) {
                Address = capAddressResult.getOutput();
                for (yy in Address) {
                    newAddress = Address[yy];
                    newAddress.setCapID(newId);
                    aa.address.createAddress(newAddress);
                    logDebug("added address");
                }
            }

            // Copy Owners  THIS IS ADDED for Sacramento County
            capOwnerResult = aa.owner.getOwnerByCapId(capId);
            if (capOwnerResult.getSuccess()) {
                Owner = capOwnerResult.getOutput();
                for (yy in Owner) {
                    newOwner = Owner[yy];
                    newOwner.setCapID(newId);
                    aa.owner.createCapOwnerWithAPOAttribute(newOwner);
                    logDebug("added owner");
                }
            }
            // Copy Work Description - This is custom for Sac County
            copyDetailedDescription(capId, newId);
            
          //Copy Application Name
            editAppName(capName,newId); 
			
			    // Copy License Prof - Added for Chesterfield 11/2020
            copyLicenseProfessional(capId, newId);

            //Copy GIS Objects This is ADDED fro SACRAMENTO COUNTY
            var holdId = capId;
            capId = newId;
            copyParcelGisObjects();
            capId = holdId;
            return newId;
        } else {
            logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
        }
    } catch (err) {
        logDebug("A JavaScript Error occurred: " + err.message + " Line " + err.lineNumber);
    }
}