<?php
//settings for json content return
header('Content-Type: application/json');
ini_set("auto_detect_line_endings", true);
//start year and end year can be changed here or obtained from the request.
$startYear = 2007;
$endYear = 2011;
//static costants
$YEAR_KEY_INDEX = 12;
$FAULT_CLASS_INDEX = 25;
$MERGED_COUNT_INDEX = 24;
$MEDICAL_SPECIALITY_INDEX = 5;
$SEVERITY_CLASS_INDEX = 10;
$TERMINATION_TIME_INDEX = 23;
$ACTION_CATEGORY_INDEX = 28;
$SUBMISSION_TYPE_INDEX = 7;
//complete list of labels here. Add more labels as needed.
$specialityLabelsArray = array("Radiology", "Cardiovascular", "Orthopedic",
                "General Hospital", "Clinical Chemistry",
                  "General & Plastic Surgery");
$actionCategoryLabels =array("Remove or Replace", "Repair", "Safety Notice/Insructions", "Software Update");
$SubmissionTypeLabels = array("510(k)", "510(K) Exempt", "PMA");

$jsonDict = array("StartYear" => $startYear, "EndYear"=> $endYear,
          "SpecialityLabels" => $specialityLabelsArray, "actionCategoryLabels" => $actionCategoryLabels,
          "Data"=>array());
//The zero index corresponds with the first year in the Data array of jsonDict
if (($handle = fopen("medical_data.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
      $yearKey = $data[$YEAR_KEY_INDEX];

      $yearKey = (int)$yearKey;
      $faultClass = $data[$FAULT_CLASS_INDEX];
      $mergedCount = $data[$MERGED_COUNT_INDEX];
      $medicalSpeciality = $data[$MEDICAL_SPECIALITY_INDEX];
      $severityClass = $data[$SEVERITY_CLASS_INDEX];
      $terminationTime= $data[$TERMINATION_TIME_INDEX];
      $actionCategory = $data[$ACTION_CATEGORY_INDEX];
      $computerFlag = false;
      $submissionType = $data[$SUBMISSION_TYPE_INDEX];
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
                                      "Radiology" => array("RecallEvents" => 0,
                                                            "MergedCount" => 0),
                                      "Cardiovascular" => array("RecallEvents" => 0,
                                                                  "MergedCount" => 0),
                                      "Orthopedic" => array("RecallEvents" => 0,
                                                              "MergedCount" => 0),
                                      "General Hospital" => array("RecallEvents" => 0,
                                                                    "MergedCount" => 0),
                                      "Clinical Chemistry" => array("RecallEvents" => 0,
                                                                      "MergedCount" => 0),
                                      "General & Plastic Surgery" => array("RecallEvents" => 0,
                                                                              "MergedCount" => 0)
                                    );
            $jsonDict["Data"][$yearKey]["SeverityClassCounts"] = array(1 => array("RecallEvents" => 0,
                                                                                  "MergedCount" => 0,
                                                                                  "TerminationTime" => 0),
                                                                        2 => array("RecallEvents" => 0,
                                                                                  "MergedCount" => 0,
                                                                                  "TerminationTime" => 0),
                                                                          3 => array("RecallEvents" => 0,
                                                                                  "MergedCount" => 0,
                                                                                  "TerminationTime" => 0),
                                                                );
            $jsonDict["Data"][$yearKey]["ActionCategoryCounts"] = array("Remove or Replace" => array("RecallEvents" => 0,
                                                                                                "MergedCount" => 0),
                                                                    "Repair" => array("RecallEvents" => 0,
                                                                                        "MergedCount" => 0),
                                                                      "Safety Notice/Insructions" => array("RecallEvents" => 0,
                                                                                                              "MergedCount" => 0),
                                                                      "Software Update" => array("RecallEvents" => 0,
                                                                                                "MergedCount" => 0));
             $jsonDict["Data"][$yearKey]["SubmissionType"] = array("510(k)" => array("RecallEvents" => 0,
                                                                                      "ClassI"=> 0,
                                                                                        "ClassII" => 0,
                                                                                          "ClassIII" => 0),
                                                                    "510(K) Exempt" => array("RecallEvents" => 0,
                                                                                      "ClassI"=> 0,
                                                                                        "ClassII" => 0,
                                                                                          "ClassIII" => 0),
                                                                    "PMA" => array("RecallEvents" => 0,
                                                                                      "ClassI"=> 0,
                                                                                        "ClassII" => 0,
                                                                                          "ClassIII" => 0));
          }
          /*the key (year) already exists. Currently all classes treated as one.
Future enhancements can include splitting these classes*/
          else{
            if($faultClass == "Computer" || $faultClass == "Software"
              || $faultClass == "Hardware" || $faultClass == "I/O"
                || $faultClass == "Battery" || $faultClass == "Other"){
              $computerFlag = true;
              $jsonDict["Data"][$yearKey]["ComputerClassRecalls"] += 1;
              $jsonDict["Data"][$yearKey]["TotalRecalls"] += (int)$mergedCount;
              if(in_array($medicalSpeciality, $specialityLabelsArray)){
                $jsonDict["Data"][$yearKey]["SpecialityCounts"][$medicalSpeciality]["MergedCount"] += (int)$mergedCount;
                
              }
              if(in_array($actionCategory, $actionCategoryLabels)){
                $jsonDict["Data"][$yearKey]["ActionCategoryCounts"][$actionCategory]["MergedCount"] += (int)$mergedCount;
                $jsonDict["Data"][$yearKey]["ActionCategoryCounts"][$actionCategory]["RecallEvents"] += 1;
              }

            }
            if($faultClass == "Not_Computer"){
              $jsonDict["Data"][$yearKey]["NotComputerClassRecalls"] += 1;
            }
            if(in_array($medicalSpeciality, $specialityLabelsArray)){
              $jsonDict["Data"][$yearKey]["SpecialityCounts"][$medicalSpeciality]["RecallEvents"] += 1;
            }
            
            if(($severityClass == 1 || $severityClass == 2 || $severityClass == 3)){
              $jsonDict["Data"][$yearKey]["SeverityClassCounts"][$severityClass]["RecallEvents"] += 1;
              $jsonDict["Data"][$yearKey]["SeverityClassCounts"][$severityClass]["MergedCount"] += (int)$mergedCount;
              if($terminationTime != "N/A"){
               $jsonDict["Data"][$yearKey]["SeverityClassCounts"][$severityClass]["TerminationTime"] += (int)$terminationTime;
              }
              
            }
            if(in_array($submissionType, $SubmissionTypeLabels)){
               $jsonDict["Data"][$yearKey]["SubmissionType"][$submissionType]["RecallEvents"] += 1;
                if(($severityClass == 1 || $severityClass == 2 || $severityClass == 3)){
                  if($severityClass == 1){
                    $jsonDict["Data"][$yearKey]["SubmissionType"][$submissionType]["ClassI"] += 1;
                  }
                  if($severityClass == 2){
                    $jsonDict["Data"][$yearKey]["SubmissionType"][$submissionType]["ClassII"] += 1;
                  }
                  if($severityClass == 3){
                    $jsonDict["Data"][$yearKey]["SubmissionType"][$submissionType]["ClassIII"] += 1;
                  }
                }
            }
          }
        }
      }
    }
    fclose($handle);
}
echo json_encode($jsonDict);
?>