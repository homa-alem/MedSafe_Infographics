<?php
//settings for json content return
header('Content-Type: application/json');
ini_set("auto_detect_line_endings", true);
//start year and end year can be changed here or obtained from the request.
$startYear = 2007;
$endYear = 2011;
//complete list of labels here. Add more labels as needed.
$specialityLabelsArray = array("Radiology", "Cardiovascular", "Orthopedic", 
                "General Hospital", "Clinical Chemistry", 
                  "General & Plastic Surgery");
$jsonDict = array("StartYear" => $startYear, "EndYear"=> $endYear, 
          "SpecialityLabels" => $specialityLabelsArray, "Data"=>array());
//The zero index corresponds with the first year in the Data array of jsonDict
if (($handle = fopen("medical_data.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      $yearKey = $data[12];
      $yearKey = (int)$yearKey;
      $faultClass = $data[25];
      $mergedCount = $data[24];
      $medicalSpeciality = $data[5];
      for ($year = $startYear; $year <= $endYear; ++$year){
        if($yearKey == $year){
          
          if(!array_key_exists($yearKey, $jsonDict["Data"])){
            //initlize the Data for the year with empty values
            $jsonDict["Data"][$yearKey]["ComputerClassRecalls"] = 0;
            $jsonDict["Data"][$yearKey]["NotComputerClassRecalls"] = 0;
            $jsonDict["Data"][$yearKey]["TotalRecalls"] = 0;
            /*initializing the specitality array. Need to specify all labels since 
            they act as filters when processing csv data, which can be erratic at times*/
            $jsonDict["Data"][$yearKey]["SpecialityCounts"] = array(
                                      "Radiology" => 0,
                                      "Cardiovascular" => 0,
                                      "Orthopedic" => 0,
                                      "General Hospital" => 0,
                                      "Clinical Chemistry" => 0,
                                      "General & Plastic Surgery" => 0
                                    );
          }
          //the key (year) already exists. Currently all classes treated as one. Future enhancements can include splitting these classes
          else{
            if($faultClass == "Computer" || $faultClass == "Software" 
              || $faultClass == "Hardware" || $faultClass == "I/O" 
                || $faultClass == "Battery" || $faultClass == "Other"){
              $jsonDict["Data"][$yearKey]["ComputerClassRecalls"] += 1;
              $jsonDict["Data"][$yearKey]["TotalRecalls"] += (int)$mergedCount;

              
            }
            if($faultClass == "Not_Computer"){
              $jsonDict["Data"][$yearKey]["NotComputerClassRecalls"] += 1;
            }
            if(in_array($medicalSpeciality, $specialityLabelsArray)){
              $jsonDict["Data"][$yearKey]["SpecialityCounts"][$medicalSpeciality] += 1;
            }
          }
        }
      }
    }
    fclose($handle);
}
echo json_encode($jsonDict);
?>

