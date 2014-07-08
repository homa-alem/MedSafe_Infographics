<?php
$row = 1;
$medSpecArray = array();
//$medTypeArray = array();
$totalCount = 0;
header('Content-Type: application/json');
ini_set("auto_detect_line_endings", true);
if (($handle = fopen("medical_data.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
       $key = $data[5];
       $key2 = $data[12];
       $val = $data[25];
       $deviceCount = $data[24];
       if(is_numeric($key2)){
        $key2 = (int)$key2;
          if(! array_key_exists($key2, $medTypeArray)){
            $medTypeArray[$key2] = array("Not_Computer" => 0, "Computer" => 0, "DeviceCount" => 0);
            
            
          }
          if($val == "Not_Computer"){
            $medTypeArray[$key2][$val] += 1;
          }
          else{
            $medTypeArray[$key2]["Computer"] += 1;
          }
          if(is_numeric($deviceCount)){
            //echo $key2 ." - " . $deviceCount ."<br/>";

              $medTypeArray[$key2]["DeviceCount"] += intval($deviceCount);
            }
       }
       if($key != "N/A"){
            $totalCount += 1;
           if(! array_key_exists($key, $medSpecArray))
           {
                $medSpecArray[$key] = 1;
           }
           else{
                $medSpecArray[$key] += 1;
           }
        }  
    }
    fclose($handle);
}
$json_array = array("labels"=>array(), "values"=>array(), "labelCount" => $totalCount);
$callback = function ($value) use ($totalCount){
            return ($value / $totalCount);
            };
$final_array = array_map($callback , $medSpecArray);
arsort($final_array);
array_splice($final_array, 13);
foreach ($final_array as $key => $value) {
    array_push($json_array["labels"], $key);
    array_push($json_array["values"], $value);
}
$final_json_array = array("specialityArray" => $json_array, "TypeArray" => $medTypeArray);
echo json_encode($final_json_array);
?>
