<?php
if (get_magic_quotes_gpc()) {
    function stripslashes_gpc(&$value)
    {
        $value = stripslashes($value);
    }
    array_walk_recursive($_GET, 'stripslashes_gpc');
    array_walk_recursive($_POST, 'stripslashes_gpc');
    array_walk_recursive($_COOKIE, 'stripslashes_gpc');
    array_walk_recursive($_REQUEST, 'stripslashes_gpc');
}
$path = $_REQUEST['path'];
$saveFile = $_REQUEST['file'];
$saveFile=substr($saveFile,0,-4).'.ini';
$resetFile = $_REQUEST['reset'];
$resetFile=substr($resetFile,0,-4).'.ini';

if(!empty($saveFile)) {
    if(isset($_REQUEST['text'])) {
        file_put_contents('..'.$path.'/config/'.$saveFile,$_REQUEST['text']);
        echo "{}";
    }
}

if(!empty($resetFile)) {
    if(file_exists('..'.$path.'/config/'.$resetFile.'.default')) {
        $text = file_get_contents('..'.$path.'/config/'.$resetFile.'.default');
        file_put_contents('..'.$path.'/config/'.$resetFile,$text);
        echo "{}";
    }
}