// ASIUA:EnvEngineering/VSMP Notice to Comply/NA/NA
// 157EE: When Custom Field List = "VIOLATIONS" has Violation Status = 'Penalty' and Assess Fee = "Checked" 
//	Then: Find fee code using Ordinance Section as fee description in Fee Schedule = "CC-ENF-STORMWATER"
//		Fee Qty is Severity * Penalty Days
//	NOTE: If the Fee item already exist on the record with a Fee Status = NEW then update the Fee; otherwise add a new Fee with a Status of NEW 
addFee_Violations("CC-ENF-STORMWATER");

