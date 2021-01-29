<?php


error_reporting(E_ALL);
ini_set('display_errors', 'on');


class db{
    private $user = '8luka';
    private $pass = 'pass8luka';
    private $host = '172.20.44.25';
    private $base = '8luka';
    private $dataCollName = 'ksiazka';
    private $userCollName = "users";
    private $sessionCollName = "session";
    private $conn;
    private $dbase;
    private $data_coll;
    private $user_coll;
    private $session_coll;
  

    function __construct()
    {
        //$this->conn = new Mongo("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");
        $this->conn = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");    
        //$this->dbase = $this->conn->selectDB($this->base);
        $this->data_coll = $this->conn->selectCollection($this->base, $this->dataCollName);
        //$this->data_coll = $this->dbase->{$this->dataCollName};
        $this->user_coll = $this->conn->selectCollection($this->base, $this->userCollName);
        //$this->user_coll = $this->dbase->{$this->userCollName};
        //$this->session_coll = $this->dbase->{$this->sessionCollName};
        $this->session_coll = $this->conn->selectCollection($this->base, $this->sessionCollName);
    }

    function select(){
        $cursor = $this->data_coll->find();
        $table = iterator_to_array($cursor);
        return $table;
    }


    function insert($data){
        $query = array('data'=>$data['data'], 'czas' => $data['czas']);
        $cursor = $this->data_coll->find($query);
        if($cursor->isDead()){
            $tmp = $this->data_coll->insertOne($data);
        }
        else{
            return false;
        }
        return true;
    }

    public function login($array){
        $usernam = $array['username'];
        $pass = $array['password'];
        $cursor = $this->user_coll->find(array('username'=> $usernam, 'password'=> $pass));
        if($cursor->isDead()){
            return false;
        }
        else{
            $session_id = md5(uniqid($usernam, true));
            $start = date('Y-m-d H:i:s', time());
            $tmp = $this->session_coll->insertOne(array('sessionID'=> $session_id, 'start'=>$start));
        }
        return $session_id;
    }

    public function logout($session){
        $tmp = $this->session_coll->find(array('sessionID'=> $session));
        if($tmp != NULL){
            $this->session_coll->deleteOne(array('sessionID'=>$session));
        }
        else{
            return false;
        }
        return true;
    }


    public function register($user_data){
        $cursor = $this->user_coll->find(array('username'=>$user_data['username']));
        if($cursor->isDead()){
            $tmp = $this->user_coll->insertOne($user_data);
        }
        else{
            return false;
        }
        return true;
    }


    function session($array){
        $tmp = $this->session_coll->find(array('sessionID'=>$array['sessionID']));
        if($tmp!= NULL){
            return true;
        }
        return false;
    }
    
};

?>