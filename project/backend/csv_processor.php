<?php
$row = 1;
$medSpecArray = array();
$totalCount = 0;
header('Content-Type: application/json');
ini_set("auto_detect_line_endings", true);
if (($handle = fopen("medical_data.csv", "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
       $key = $data[5];
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
echo json_encode($json_array);
?>
