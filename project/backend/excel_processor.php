<?php
header('Content-Type: application/json');
/** Error reporting */
error_reporting(E_ALL);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);


/** PHPExcel_IOFactory */
require_once dirname(__FILE__) . '/lib/Classes/PHPExcel/IOFactory.php';

$objReader = PHPExcel_IOFactory::createReader('Excel2007');
$objPHPExcel = $objReader->load("/Users/Manasvi/Documents/data-visualization/data/Merged_Final_Unique_Recalls_2007_2011.xlsx");
$column = 'F';
$medSpecArray = array();
$totalCount = 0;


foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {

    foreach ($worksheet->getRowIterator() as $row) {

        $cellIterator = $row->getCellIterator();    
        $cellIterator->setIterateOnlyExistingCells(true); // Loop all cells, even if it is not set
        foreach ($cellIterator as $cell) {
            if (!is_null($cell) && substr($cell->getCoordinate(), 0 ,1) ==="F" && $cell->getCalculatedValue() != "N/A"
                 && $cell->getCoordinate() != "F1") {
                $totalCount += 1;
                if(!array_key_exists($cell->getCalculatedValue(), $medSpecArray)){
                    $medSpecArray[$cell->getCalculatedValue()] = 1;
                }
                else{
                    $medSpecArray[$cell->getCalculatedValue()] += 1;
                }
            }
        }
    }
}
$json_array = array("labels"=>array(), "values"=>array(), "labelCount" => $totalCount);
$callback = function ($value) use ($totalCount){
            return ($value / $totalCount);
            };
$final_array = array_map($callback , $medSpecArray);

arsort($final_array);
foreach ($final_array as $key => $value) {
    array_push($json_array["labels"], $key);
    array_push($json_array["values"], $value);
}
echo json_encode($json_array);
