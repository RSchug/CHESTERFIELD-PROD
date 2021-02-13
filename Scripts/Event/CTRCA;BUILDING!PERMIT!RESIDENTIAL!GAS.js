//Add Fees//
if (AInfo["Nature of Work"] == "New Natural Gas" && (AInfo["Type of Building"] != "Multi-Family Dwelling") && !feeExists("NATURAL")){
addFee("NATURAL","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "Repair or Replacement with like appliance (natural or propane)" && !feeExists("REPAIR")){
addFee("REPAIR","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Propane Gas Work"] == "Propane tank and/or product line, and gas piping to appliances" && (AInfo["Type of Building"] != "Multi-Family Dwelling") && !feeExists("PROPANE")){
addFee("PROPANE","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Propane Gas Work"] == "Gas piping to appliances only" && !feeExists("GASPIPING")){
addFee("GASPIPING","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Propane Gas Work"] == "Propane tank and/or product line only" && !feeExists("PROPANETANK")){
addFee("PROPANETANK","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Propane Gas Work"] == "Mobile or manufactured homes on private property" && !feeExists("MANUFACTURED")){
addFee("MANUFACTURED","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Nature of Work"] == "New Natural Gas" && AInfo["Type of Building"] == "Multi-Family Dwelling" && !feeExists("MULTIFAMILY")){
addFee("MULTIFAMILY","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}

if (AInfo["Propane Gas Work"] == "Propane tank and/or product line, and gas piping to appliances" && AInfo["Type of Building"] == "Multi-Family Dwelling" && !feeExists("MULTIPROPANE")){
addFee("MULTIPROPANE","CC-BLD-RES-GAS","FINAL",1,"Y");
updateFee("STATELEVY","CC-BLD-RES-GAS","FINAL",1,"Y")}