<?php
$path = $_REQUEST['path'];

$results = array();
$handler = opendir('../'.$path.'/config/images');

while ($file = readdir($handler)) {
    if ($file != "." && $file != "..") {
        list($width, $height, $type, $attr) = getimagesize('../'.$path.'/config/images/'.$file);
        $results[] = array(
            'file'=>$file,
            'height'=>$height,
            'width'=>$width
        );
    }
}
echo json_encode($results);