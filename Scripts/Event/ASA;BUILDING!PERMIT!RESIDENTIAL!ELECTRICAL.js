//Add Fees//
if (!publicUser) {
if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Single-Family Dwelling" && !feeExists("NEWSFD")){
addFee("NEWSFD","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Mobile or Manufactured Home on Private Property" && !feeExists("MOBILE")){
addFee("MOBILE","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Industrialized (Modular Home)" && !feeExists("INDUSTRIAL")){
addFee("INDUSTRIAL","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "Addition, Renovation, Conversion" && AInfo["Rough-in Inspection"] == "Existing" && !feeExists("ADDEXISTING")){
addFee("ADDEXISTING","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "Addition, Renovation, Conversion" && AInfo["Rough-in Inspection"] == "Required" && !feeExists("ADDITION")){
addFee("ADDITION","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "Service Change, Relocation, Replacement, Repair" && !feeExists("CHANGEREP")){
addFee("CHANGEREP","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Multi-Family Dwelling" && !feeExists("MULTIFAMILY")){
addFee("MULTIFAMILY","CC-BLD-RES-ELEC","FINAL",houseCount,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New" && AInfo["Type of Building"] == "Accessory Structure" && !feeExists("ADDITION")){
addFee("ADDITION","CC-BLD-RES-ELEC","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-ELEC","FINAL",1,"Y")}
}
