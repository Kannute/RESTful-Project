var req;
var object_JSON;
var mongodb_id;

/*** Tworzenie indeksowanej bazy danych ***/

var db;

function init() {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB; 
    openDB();
}

function openDB(){
    var indexedDB_request = indexedDB.open("database", 2);

    indexedDB_request.onerror = function(){
        console.log("Error whilst creating a database!");
    }

    indexedDB_request.onsuccess = function(){
        db= indexedDB_request.result;
        console.log("Successfuly created a database");
    }

    indexedDB_request.onupgradeneeded = function(){
        db = indexedDB_request.result;
        var storage = db.createObjectStore("ksiazka", {keyPath: "id", autoIncrement: true});
        storage.createIndex("data", "data");
        storage.createIndex("godzina", "godzina");
        storage.createIndex("tytul", "tytul");
        storage.createIndex("autor", "autor");
    }
}

/* Sprawdzenie stanu połączenia internetowego */

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);


$("document").ready( ()=>{
    updateStatus();
    init();
    createCookies();
});

/******  Funkcje ******/

function offlineDataForm(){
    /* Generowanie formularza do wprowadzania danych offline */

    let my_form = "<div class='input_offline' id='inputDiv' style=' position: fixed;top: 50%;left: 50%; -webkit-transform: translate(-50%, -50%);  transform: translate(-50%, -50%);'><h3 style='text-align: center;'>Poniżej wprowadź dane książki:</h3>" +
    "<form name='insert_data' ><table>" +
    "<tr><td>Data:</td><td><input class='form_input' type='date' name='data'></input></td></tr>" + 
    "<tr><td>Godzina:</td><td><input class='form_input' type='time' name='czas'></input></td></tr>" +
    "<tr><td>Tytuł:</td><td><input class='form_input' type='text' name='tytul'></input></td></tr>" +
    "<tr><td>Autor:</td><td><input class='form_input' type='text' name='autor'></input></td></tr>" +
    "<tr><td></td><td><input class='butt' type='button' value='Zapisz' onclick='insertOffline(this.form)'></td></tr>" +
    "</table></form></div>" +
    "<div id='result'></div>";

    $("#dataDiv").html(my_form);
}


function onlineDataForm(){
    /* Generowanie formularza do wprowadzania danych online */

    let my_form = "<div class='input_online' id='inputDiv' style=' position: fixed;top: 50%;left: 50%; -webkit-transform: translate(-50%, -50%);  transform: translate(-50%, -50%);'><h3 style='text-align: center;'><h3 style='text-align: center;'>Poniżej wprowadź dane książki:</h3>" +
    "<form name='insert_data' ><table>" +
    "<tr><td>Data:</td><td><input class='form_input' type='date' name='data'></input></td></tr>" + 
    "<tr><td>Godzina:</td><td><input class='form_input' type='time' name='czas'></input></td></tr>" +
    "<tr><td>Tytuł:</td><td><input class='form_input' type='text' name='tytul'></input></td></tr>" +
    "<tr><td>Autor:</td><td><input class='form_input' type='text' name='autor'></input></td></tr>" +
    "<tr><td></td><td><input class='butt' type='button' value='Zapisz' onclick='insertOnline(this.form)'></td></tr>" +
    "</table></form></div>" +
    "<div id='result'></div>";

    $("#chartDiv").css("display,", "none");
    $("#dataDiv").html(my_form);
}


function formValidation(form){
    /* Sprawdzanie poprawnosci wprowadzonych danych */
    if(form.data.value == "" || form.czas.value == "" || form.autor.value == "" || form.tytul.value == ""){
        alert("Prosze wypelnic wszystkie pola")
        return false;
    }

    return true;
}


function insertOffline(form){
    /* Wprowadzanie danych offline */

    if(formValidation(form)){
        let arr = {}
        arr.data = form.data.value;
        arr.czas = form.czas.value;
        arr.tytul = form.tytul.value;
        arr.autor = form.autor.value;

        var tran = db.transacition("ksiazka", "readwrite");
        var storage = tran.objectStore("ksiazka");
        $("#result").html("Dane zostały ?");
        if(storage.put(arr)){
            $("#result").html("Dane zostały wprowadzone");
        }

    }
}

function insertOnline(form){
    /* Wprowadzanie danych online */

    if(formValidation(form)){
        let arr = {}
        arr.data = form.data.value;
        arr.czas = form.czas.value;
        arr.tytul = form.tytul.value;
        arr.autor = form.autor.value;

        var dane = JSON.stringify(arr);

        $.ajax({type: "POST",
                url: "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/insert",
                data : dane,
                success : function(response) {
                    if (response["status"] == "ok") {
                        alert("Pomyślnie wprowadzono dane");
                    } else {
                        alert(response["msg"]);
                    }
                },
                error : function(response) {
                    alert(response);
                    alert("Wystąpił błąd podczas tworzenia XMLHttpRequest");
                }
            })
    }
}


function offlineDataShow(){
    /* Pobranie danych offline */

    let list = "<div class='data_table'>" +
    "<h2>Wpis książek offline:</h2>" +
    "<table><tr><th>Data</th><th>Godzina</th><th>Tytuł</th><th>Autor</th></tr>";


    var tran = db.transaction("ksiazka", "readwrite");
    var storage = tran.objectStore("ksiazka");
    storage.openCursor().onsuccess = function (event){
        if(cursor){
            console.log(cursor.value.data);
            list = list + "<tr><td>" + cursor.value.data + "</td><td>" +
            cursor.value.czas +"</td><td>"+ cursor.value.tytul + "</td><td>" +
            cursor.value.autor +"</td>";
            cursor.continue();
        }else{
            list = list + "</table></div>"
            $("#dataDiv").html(list);
        }
    }
    storage.openCursor().onerror = function(event){
        console.error("Wystąpił błąd podczas dodawania rekordu online");
    }
}


function onlineDataShow(){
    /* Pobranie danych online */

    let list = "<div class='choose'>" +
    "<h2>Wykaz książek online:</h2>" +
    "<button type='button' onclick='generateTable()'>Wyświetl dane</button>" +
    "<button type='button' onclick='getBookData()'>Przejdź do wykresów</button>" +
    "</div>";

    $("#chartDiv").css("display", "none");
    $("#dataDiv").html(list);
}



function generateTable(){
    /* Generowanie tabeli z informacjami o książkach */

    let list = "<div class='data_table'>" +
    "<h2>Dane online:</h2>" +
    "<table><tr><th>Data</th><th>Godzina</th><th>Tytył</th><th>Autor</th></tr>";

    $.ajax({
        method : "GET",
        url : "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/get_all_data",
        success : function(response) {
            response.forEach((item) => {
                list = list + "<tr><th>" + item.data + '</th><th>' + item.czas + '</th><th>' + item.tytul + '</th><th>' + item.autor + '</th></tr>';
            })
            list = list + "</table></div>"
            $("#dataDiv").html(list);
        },
        error : function() {
            alert("Wystąpił błąd przy pozyskiwaniu danych z bazy!");
        }
    })
}

var months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
 
function getBookData(){
    /* Pobranie danych o książkach */

    let list = "<div class='data_table'>" +
    "<button type='button' onclick='generateChart(months)'>Generuj wykres miesięcznych dostaw</button>" +
    "</div>";

    $.ajax({
        async : false,
        method : "GET",
        url : "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/get_all_data",
        success : function(response) {
            response.forEach((item) => {
                date = new Date(item.data);
                months[date.getMonth()] += 1;
                hours[parseInt(item.czas.substring(0, 2))] += 1;
            })
        }
    })

    
   $("#dataDiv").html(list);
}

function generateChart(months){
    /* Generowanie wykresu książek dostarczonych w danym miesiącu */

    $("#dataDiv").html("");

    var chart = new CanvasJS.Chart("chart", {

        theme: "dark2",
        animationEnabled: true,
        title: {
            text : "Ilosc dostarczonych ksiazek w danym miesiacu"
        },
        axisX:{
            title: "Miesiace"
        },
        axisY: {
            title: "Ilosc"
        },

        data: [{
            type: "column",
            showInLegend : true,
            legendMarkerColor: "grey",
            dataPoints: [
                {y: months[0], label: "Styczeń"},
                {y: months[1], label: "Luty"},
                {y: months[2], label: "Marzec"},
                {y: months[3], label: "Kwiecień"},
                {y: months[4], label: "Maj"},
                {y: months[5], label: "Czerwiec"},
                {y: months[6], label: "Lipiec"},
                {y: months[7], label: "Sierpień"},
                {y: months[8], label: "Wrzesień"},
                {y: months[9], label: "Październik"},
                {y: months[10], label: "Listopad"},
                {y: months[11], label: "Grudzień"}
            ]
        }]
    });

    $("#chartDiv").css("display", "block");
    chart.render();
}


function logOut(){
    /* Wylogowanie się użytkownika */

    var session_id = get_cookies();
    var data = {};
    data.sessionID = session_id;
    dane = JSON.stringify(data);


    $.ajax({
        method : "POST",
        url : "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/logout",
        data : data_to_send,
        success : function(response) {
            if (response["status"] == "ok") {
                alert("Wylogowano użytkownika");
                offlineMenu();
                set_cookies('');
            } else {
                alert(response);
                alert(response["msg"]);
            }
        }
    })

    $("#chartDiv").css("display", "none");
}


function loginForm(){
    /* Formularz logowania się użytkownika */

    if(!navigator.onLine){
        alert("Brak połączenia z internetem");
    }

    let form_html = "<form class='input' style=' position: fixed;top: 50%;left: 50%; -webkit-transform: translate(-50%, -50%);  transform: translate(-50%, -50%);'><h3 style='text-align: center;'>" +
    "<h3>Zaloguj się</h3>"+
    "<input type='text' name='login' placeholder='login' required><br>" +
    "<input type='password' name='password' placeholder='haslo' required><br>" +
    "<input type='button' value='Zaloguj' onclick='log_user(this.form)'>" +
    "</form>"
    $("#dataDiv").html(form_html);
}

function registerForm(){
    /* Formularz do rejestracji użytkownika*/

    let form_html = "<form class='input' style=' position: fixed;top: 50%;left: 50%; -webkit-transform: translate(-50%, -50%);  transform: translate(-50%, -50%);'><h3 style='text-align: center;'>" +
    "<h3>Zarejestruj się</h3>"+
    "<input type='text' name='login' placeholder='login' required><br>" +
    "<input type='password' name='password' placeholder='haslo' required><br>" +
    "<input type='button' value='Rejestracja' onclick='newUser(this.form)'>" +
    "</form>"
    $("#dataDiv").html(form_html);
}


function newUser(form){
    /* Dodanie użytkownika do bazy */

    if(registerValidation(form)){
        var user_data = {}
        user_data.username = form.login.value
        user_data.password = form.password.value
        var data_to_send = JSON.stringify(user_data)
        $.ajax({
            type : "POST",
            url : "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/register",
            data : data_to_send,
            success : function(response) {
                if (response["status"] == "ok") {
                    alert("Zarejstrowano pomyślnie!");
                } else {
                    alert(response["msg"]);
                }
            },
            error : function() {
                alert("Wystąpił błąd przy rejestracji");
            }
        })
    }
}


function log_user(form){
    if(registerValidation(form)){
        var user_data = {};
        user_data.username = form.login.value;
        user_data.password = form.password.value;
        var data_to_send = JSON.stringify(user_data);
        $.ajax({
            type: "POST",
            url: "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/login",
            data: data_to_send,
            success : function(response){
                if(response["status"] == "ok"){
                    onlineMenu();
                    clear_local_database();
                    set_cookies(response["sessionID"]);
                }else{
                    alert(response["msg"]);
                }
            },
            error : function(){
                alert("Wystąpił błąd przy tworzeniu XMLHttpRequest");
            }
        })
    }
}



function onlineMenu(){
    $("#btnOfflineData").css("display", "none");
    $("#btnOfflineShow").css("display", "none");
    $("#btnLogin").css("display", "none");
    $("#btnRegister").css("display", "none");
    $("#btnOnlineShow").css("display", "inline");
    $("#btnOnlineData").css("display", "inline");
    $("#btnLogout").css("display", "inline");
    $("#dataDiv").html("");
}


function offlineMenu(){
    $("#btnOfflineData").css("display", "inline");
    $("#btnOfflineShow").css("display", "inline");
    $("#btnLogin").css("display", "inline");
    $("#btnRegister").css("display", "inline");
    $("#btnOnlineShow").css("display", "none");
    $("#btnOnlineData").css("display", "none");
    $("#btnLogout").css("display", "none");
    $("#dataDiv").html("");
}


function registerValidation(form) {
    if (form.login.value == "" || form.password.value == "") {
        alert("Wypełnij wszystkie pola!");
        return false;
    }
    if (form.login.value.length <= 1 || form.password.value.length <= 5) {
        alert("Login musi mieć conajmniej 1 znak! Hasło musi być dłuższe niż pięć znaków!");
        return false;
    }
    return true;
}


function updateStatus(event) {

    var status_text = document.getElementById("statusInfo");

    if (navigator.onLine) {
        status_text.innerHTML = "Połączono z internetem.";
        $("#statusInfo").css("background-color","green");
    } else {
        status_text.innerHTML = "Brak połączenia internetowego.";
        $("#statusInfo").css("background-color","red");
    }
}



function createCookies() {
    let array = {};
    let session_id = get_cookies();
    alert("SessionID: " + session_id);
    array.sessionID = session_id;
    data_to_send = JSON.stringify(array);
    $.ajax({
        type: "POST",
        url: "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/session",
        data : data_to_send,
        success : function(response) {
            if (response["status"] == "ok") {
                onlineMenu();
            } else {
                alert(response);
                alert(response["msg"]);
                offlineMenu();
            }
        },
        error : function() {
            console.log("Failed to create cookies");
        }
    })
}


function set_cookies(value) {
    document.cookie = "sessionID=" + value + "; path=/";
}


function get_cookies() {

    let tmp;
    let browser_cookies = document.cookie.split(';');
    for (var i = 0; i < browser_cookies.length; i++) {
        tmp = browser_cookies[i];
        let remove_spaces = 0;
        while (tmp.charAt(remove_spaces) == ' ') {
            remove_spaces = remove_spaces + 1;
        }
        tmp = tmp.substring(remove_spaces, tmp.length - remove_spaces);
        if (tmp.indexOf("sessionID=") == 0) {
            return tmp.substring("sessionID=".length, tmp.length);
        }
    }
    return "";
}

function clear_local_database() {
    var count = 0;
    var trans = db.transaction("ksiazka", "readwrite");
    var storage = trans.objectStore("ksiazka");
    storage.openCursor().onsuccess = async function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var array = {};
            array.data = cursor.value.data;
            array.czas = cursor.value.czas;
            array.tytul = cursor.value.tytul;
            array.autor = cursor.value.autor;

            data_to_send = JSON.stringify(array);
            $.ajax({
                type : "POST",
                url : "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/insert",
                data : data_to_send
            })
            cursor.delete();
            count = count + 1;
            cursor.continue();
        }
    }
   
}

