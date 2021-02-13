if (wfTask == "Permit Issuance" && wfStatus == "Issued"){
       newChildID = createChild("Building","Permit","Residential","NA",""); copyAppSpecific(newChildID); comment("New Building Permit app id = "+ newChildID);
       saveCapId = capId;
       capId = newChildID;
       branchTask("Application Submittal","Accepted - Plan Review Not Required","Issued as MultiUnit","")
       capId = saveCapId;


       newChildID2 = createChild("Building","Permit","Residential","NA",""); copyAppSpecific(newChildID2); comment("New Building Permit app id = "+ newChildID);
       saveCapId = capId;
       capId = newChildID2;
       branchTask("Application Submittal","Accepted - Plan Review Not Required","Issued as MultiUnit","")
       capId = saveCapId;

//     newAuxID = createChild("Building","Permit","Residential","AuxiliaryElectrical","",newChildID); copyAppSpecific(newAuxID); comment("New Elec Permit app id = "+ newChildID);
//     newAuxID = createChild("Building","Permit","Residential","AuxiliaryMechanical","",newChildID); copyAppSpecific(newAuxID); comment("New Mech Permit app id = "+ newChildID);
//     newAuxID = createChild("Building","Permit","Residential","AuxiliaryPlumbing","",newChildID); copyAppSpecific(newAuxID); comment("New Plum Permit app id = "+ newChildID);
//     capId = saveCapId;
       
    }



// This creates the Structure when the 
if (wfTask == "Certificate of Occupancy" && wfStatus == "Clear CO Issued"){
      newParentID = createParent("Building","Structure","NA","NA",""); copyAppSpecific(newParentID); comment("New Structure id = "+ newParentID);
     
    }

