# RESTful-Project

#### PL

## System rejestracji danych z wykorzystaniem trybu offline przeglądarki

### 1. Zawartośc merytoryczna
Jest to prosta strona działająca po stronie przeglądarki w trybie online i offline.
W trybie offline (bez połączenia z serwisem) możliwe jest zapisanie danych do lokalnej bazy danych dostepnej w
przeglądarce. Dostepna jest również możliwość przeglądania zgromadzonych danych w systemie lokalnym przeglądarki.
W trybie online (połaczenie z serwerem) następuje przesłanie danych klienta do serwisu (dane lokalne po zapisaniu
w serwisie są usuwane). Wprowadzane dane sa walidwoane po stronie przeglądarki z wykorzystaniem języka Javascript.
Połączenie z serwerem następuje po uwierzytelnieniu. 

Tematem przewodnim jest zbieranie danych ankietowych dla magazynu księgarni. Na podstawie danych wprowadzanych przez
użytkowników, można wygenerować wykres (przy pomocy canvasJS) ilości książek dostarczonych w danym miesiącu.

### 2. Wykorzystane technologie

#### Języki
Po stronie serwera: PHP
Po stronie przeglądarki: HTML5 (+ CSS), Javascript

#### Bazy danych
Dostęp do bazy danych zrealizowany poprzez server MongoDB

#### Połączenie pomiędzy klientem a serwerem WWW
Zrealizowane przy pomocy technologi Ajax