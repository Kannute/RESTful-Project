<?php
 
require 'vendor/autoload.php' ;
include 'rest/mongo.php';
$db = new db();
 
print "<pre>" ;
 
print "Polaczono z baza danych" ;
 
// Test insert()
print "Test insert() function <br/>" ;
$record = array ( 'ident' => 1, 'fname' => 'mirek', 'lname' => 'kowalski', 'faculty' => 'wfiis', 'year' => '2015' ) ;
$flag = $db->insert($record);
//print "[ ".$flag." ]";
print $flag?"OK":"not OK";
print "<br/>";
$record = array ( 'ident' => 2, 'fname' => 'adam', 'lname' => 'abacki', 'faculty' => 'wfiis', 'year' => '2015' ) ;
$flag = $db->insert($record);
//print "[ ".$flag." ]";
print $flag?"OK":"not OK";
print "<br/>";
 
print "\n<br/>------------ <br/>\n" ;
 
 
// Test select()
print "Test select() function <br/>\n" ;
$data = $db->select();
print_r($data) ;
print "\n<br/>------------ <br/>\n" ;
 
// Test delete()
print "Test delete() function <br/>\n" ;
$id =  1  ;
$flag = $db->delete($id,0) ;
print "[ ".$flag." ]";
 
print "\n<br/>----------- <br/>\n" ;
 
// Test update() 
print "Test update() function <br/>\n";
$id =  2  ;
$data = array ( 'year' => '2016' ) ;
$flag = $db->update($id,$data,0) ;
print "[ ".$flag." ]";
 
print "\n<br/>----------- <br/>\n" ;
print "</pre>" ;
 
?>