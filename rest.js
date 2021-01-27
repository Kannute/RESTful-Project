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

window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);



$("document").ready( ()=>{
    updateStatus();
    init();
    create_cookies();
});




function data_offline_form(){
    
    let my_form = "<div class='input_offline'><h3 style='text-alignL center;'>Poniżej wprowadź dane książki:</h3>" +
    "<form name='insert_data' ><table>" +
    "<tr><td>Data:</td><td><input class='form_input' type='date' name='data' value=" + year + "-" + month + "-" + day + "></input></td></tr>" + 
    "<tr><td>Godzina:</td><td><input class='form_input' type='time' name='czas'></input></td></tr>" +
    "<tr><td>Tytuł:</td><td><input class='form_input' type='text' name='tutul'></input></td></tr>" +
    "<tr><td>Autor:</td><td><input class='form_input' type='text' name='autor'></input></td></tr>" +
    "<tr><td></td><td><input class='butt' type='button' value='Zapisz' onclick='insert_data_offline(this.form)'></td></tr>" +
    "</table></form></div>" +
    "<div id='result'></div>";

    $("data").html(my_form);
}


function data_online_form(){

    let my_form = "<div class='input_offline'><h3 style='text-alignL center;'>Poniżej wprowadź dane książki:</h3>" +
    "<form name='insert_data' ><table>" +
    "<tr><td>Data:</td><td><input class='form_input' type='date' name='data' value=" + year + "-" + month + "-" + day + "></input></td></tr>" + 
    "<tr><td>Godzina:</td><td><input class='form_input' type='time' name='czas'></input></td></tr>" +
    "<tr><td>Tytuł:</td><td><input class='form_input' type='text' name='tutul'></input></td></tr>" +
    "<tr><td>Autor:</td><td><input class='form_input' type='text' name='autor'></input></td></tr>" +
    "<tr><td></td><td><input class='butt' type='button' value='Zapisz' onclick='insert_data_offline(this.form)'></td></tr>" +
    "</table></form></div>" +
    "<div id='result'></div>";

    $("#chart").css("display,", "none"));
    $("#data").html(my_form);
}



function validate_form(form){
    if(form.data.value == "" || form.czas.value == "" || form.autor.value == "" || form.tytul.value == ""){
        console.log("Invalid data entered!");
        $("#result").html("");
        return false;
    }

    return true;
}


/* Dodawanie danych w trybie offline i online */


function insert_data_offline(form){
    if(validate_form(form)){
        let arr = {}
        arr.data = form.data.value;
        arr.czas = form.czas.value;
        arr.tytul = form.autor.value;
        arr.autor = form.autor.value;

        var tran = db.transacition("ksiazka", "readwrite");
        var storage = tran.objectStore("ksiazka");

        if(storage.put(arr)){
            $("#result").html("Dane zostały wprowadzone");
        }

    }
}

function insert_data_online(form){
    if(validate_form(form)){
        let arr = {}
        arr.data = form.data.value;
        arr.czas = form.czas.value;
        arr.tytul = form.autor.value;
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


/* Wykaz danych w trybie offline i online */

function show_data_offline(){
        
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
            $("#data").html(list);
        }
    }
    storage.openCursor().onerror = function(event){
        console.error("Wystąpił błąd podczas dodawania rekordu online");
    }
}


function show_data_online(){
    let list = "<div class='choose'>" +
    "<h2>Wykaz książek online:</h2>" +
    "<button type='button' onclick='show_table()'>Wyświetl dane</button>" +
    "<button type='button' onclick='draw_data()'>Rysuj wykres</button>" +
    "</div>";

    $("#chart").css("display", "none");
    $("#data").html(list);
}



function show_table(){
    let list = "<div class='data_table'>" +
    "<h2>Dane online:</h2>" +
    "<table><tr><th>Data</th><th>Godzina</th><th>Tytył</th><th>Autor</th></tr>";

    $.ajax({
        method : "GET",
        url : "http://pascal.fis.agh.edu.pl/~8luka/projekt2/rest/get_all_data",
        success : function(response) {
            response.forEach((item) => {
                list = list + "<tr><th>" + item.data + '</th><th>' + item.czas + '</th><th>' + item.objawy + '</th><th>' + item.diagnoza + '</th></tr>';
            })
            alert("Udało się pozyskać dane!");
            list = list + "</table></div>"
            $("#data").html(list);
        },
        error : function() {
            alert("Wystąpił błąd przy próbie uzyskania danych.");
        }
    })
}

var months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
 
function draw_data(){
    let list = "<div class='data_table'>" +
    "<button type='button' onclick='generate_chart(months)'>Generuj wykres</button>" +
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
            alert("Udało się załadować dane");
        }
    })

    
   $("#data").html(list);
}

function generate_chart(months){
    $("#data").html("");

    var chart = new CanvasJS.Chart("chart", {

        theme: "dark2",
        animationEnabled: true,
        title: {
            text : "Ilosc dostarczonych ksiazek w danym miesiacu"
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

    $("#chart").css("display", "block");
    chart.render();
}




/* Logowanie sie do systemu */

function logout_user(){
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
    
    $("#chart").css("display", "none");
}