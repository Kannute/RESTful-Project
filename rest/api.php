<?php

require '../vendor/autoload.php';
require_once("rest.php");
require_once("mongo.php");
      
class API extends REST {
      
    public $data = "";
      
    public function __construct(){
        parent::__construct();      // Init parent contructor
              $this->db = new db() ;             // Initiate Database
    }
              
    public function processApi(){
  
        $func = "_".$this->_endpoint ; 
        if((int)method_exists($this,$func) > 0) {
            $this->$func();
              }  else {
            $this->response('Page not found',404); }         
    }
    
    private function _register(){
        
        if($this->get_request_method() != "POST")
            $this->response('',406);
        if(!empty($this->_request) ){
            try {
                $json_array = json_decode($this->_request,true);
                
                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status' => 'failed', 'msg' => 'Niekompletne dane');
                        $this->response($this->json($result), 400);
                    }
                }
                $res = $this->db->register($json_array);
                if ( $res ) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), 200);
                } 
                else {
                    $result = array('status' => 'failed', "msg" => 'Istnieje już login o takiej nazwie');
                    $this->response($this->json($result), 200);
                }    
            } 
            catch (Exception $e) {
                $error = array('status' => "failed", "msg" => "Wystąpił błąd przy przetwarzaniu requesta.");
                $this->response($this->json($error), 400);
            }
        } 
        else {
            $error = array('status' => "failed", "msg" => "Złe dane wysłania");
            $this->response($this->json($error), 400);
        }
        
    }
    
    private function _login() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        
        if(!empty($this->_request)) {
            try {
                $json_array = json_decode($this->_request, true);

                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status' => 'failed', 'msg' => 'Niekompletne dane');
                        $this->response($this->json($result), 400);
                    }
                }

                $res = $this->db->login($json_array);
                if ($res) {
                    $result = array('status' => 'ok', 'sessionID' => $res);
                    $this->response($this->json($result), 200);
                }
                else {
                    $result = array('status' => 'failed', 'msg' => 'Niepoprawny login i/lub hasło');
                    $this->response($this->json($result), 200);
                }
            } 
            catch (Exception $e) {
                $error = array('status' => 'failed', 'msg' => 'Wystąpił problem przy przetwarzaniu requesta');
                $this->response($this->json($error), 400);
            }
        }
        else {
            $error = array('status' => 'failed', "msg" => "Złe dane wysłania");
            $this->response($this->json($error), 400);
        }
    }

    private function _logout() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }

        if (!empty($this->_request)) {
            try {
                $json_array = json_decode($this->_request, true);
                $res = $this->db->logout($json_array);
                if ($res) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), 200);
                } else {
                    $error = array('status' => 'failed', 'msg' => 'Zły sessionID');
                    $this->response($this->json($error), 200);
                }   
            }
            catch (Exception $e){
                $this->response('', 400);
            }
        }
        else {
            $error = array('status' => 'failed', 'msg' => 'Błąd sesji');
            $this->response($this->json($error), 400);
        }
    }
  

    private function _session(){
        if($this->get_request_method() != "POST")
            $this->response('',406);

        if(!empty($this->_request) ){
            try {
                $json_array = json_decode($this->_request,true);
                
                foreach ($json_array as $key => $value) {
                    if ($value == ''){
                        $result = array('status'=>'failed', 'msg' => 'Błąd w wysyłaniu danych');
                        $this->response($this->json($result), 400);
                    }
                }
                $res = $this->db->session($json_array);
                if ( $res ) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), 200);
                } 
                else{
                    $result = array('status' => 'Sesja wyczerpała się');
                    $this->response($this->json($result), 200);
                } 
            } 
            catch (Exception $e){
                $error = array('status' => "failed", "msg" => "Rzucono wyjątek");
                $this->response('', 402);
            }
        } 
        else {
            $error = array('status' => "failed", "msg" => "Złe dane wysłania");
            $this->response($this->json($error), 401);
        } 

    }

    private function _get_all_data() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        try {
            $result = $this->db->select();
            $this->response($this->json($result), 200);
        } catch (Exception $e) {
            $this->response('', 400);
        }
    }

    private function _insert() {
        if($this->get_request_method() != "POST")
            $this->response('',406);

        if (!empty($this->_request)) {
            try {
                $json_array = json_decode($this->_request, true);

                foreach ($json_array as $key => $value) {
                    if ($value == '') {
                        $result = array('status' => 'failed', 'msg' => 'Błąd w wysyłaniu danych');
                        $this->response($this->json($result), 400);
                    }
                }

                $datetime = date("Y-m-d", strtotime($json_array['data']));
                $now = date("Y-m-d", strtotime('+2 minutes'));

                if ($datetime > $now) {
                    $result = array('status' => 'failed', 'msg' => 'Niepoprawne dane');
                    $this->response($this->json($result), 400);
                }

                $res = $this->db->insert($json_array);
                if ($res) {
                    $result = array('status' => 'ok');
                    $this->response($this->json($result), '200');
                } else {
                    $error = array('status' => 'failed', 'msg' => 'Dane o tej dacie i godzine zostały juz wprowadzone');
                    $this->response($this->json($array), 400);
                }
            }
            catch (Exception $e) {
                $error = array('status' => 'failed', 'msg' => 'Złe dane wysłania');
                $this->response($this->json($error), 400);
            }
        }
    }


    
    private function _delete($flag){
        if($this->get_request_method() != "DELETE"){
            $this->response('',406);
        }
        $id = $this->_args[0];
        if(!empty($id)){                
                     $res = $this->db->delete($id,$flag);
                     if ( $res ) {
                $success = array('status' => "Success", "msg" => "Successfully one record deleted. Record - ".$id);
                $this->response($this->json($success),200);
                     } else {
                         $failed = array('status' => "Failed", "msg" => "No records deleted" );
                         $this->response($this->json($failed),200);
                     }
        }else {
             $failed = array('status' => "No content", "msg" => "No records deleted" );
                         $this->response($this->json($failed),204);    // If no records "No Content" status
                }
    }
         
  
    private function _update($flag){
        if($this->get_request_method() != "PUT"){
            $this->response('',406);
        }
        $id = $this->_args[0];
                $json_array = json_decode($this->_request,true);;
        if(!empty($id)){
                     $res = $this->db->update($id,$json_array,$flag) ;                
                     if ( $res > 0 ) {
               $success = array('status' => "Success", "msg" => "Successfully one record updated.");
               $this->response($this->json($success),200);
                     } else {
               $failed = array('status' => "Failed", "msg" => "No records updated.");
               $this->response($this->json($failed),200);
                     }                        
        }else
            $this->response('',204); // If no records "No Content" status        
    }
  
    private function json($data){
        if(is_array($data)){
            return json_encode($data);
        }
    }
}
          
    $api = new API();
    $api->processApi();
  
?>