var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
            "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
    ehrId = "";

    var heights = [
        ["178", "180", "182", "183", "185", "187", "188", "188", "189", "190"],
        ["164", "165", "167", "167", "167", "167", "167", "167", "167", "168"],
        ["155", "156", "160", "165", "172", "178", "180", "180", "180", "180"]
    ];
    var mass = [
        ["78", "79", "78", "77", "80", "78", "79", "81", "83", "79"],
        ["90", "87", "100", "95", "97", "88", "95", "97", "101", "110"],
        ["40", "43", "48", "46", "53", "41", "47", "52", "55", "53"]
    ];

    var sisTlak = [
        ["112", "120", "122", "117", "114", "112", "115", "121", "118", "114"],
        ["142", "144", "147", "139", "151", "131", "146", "149", "151", "153"],
        ["120", "118", "122", "123", "120", "115", "113", "122", "118", "121"]
    ];
    var diaTlak = [
        ["81", "76", "77", "79", "79", "80", "76", "77", "78", "79"],
        ["87", "88", "89", "92", "91", "89", "95", "89", "94", "95"],
        ["82", "78", "84", "82", "81", "83", "82", "77", "79", "81"]
    ];

    switch (stPacienta) {
        case 1:
            ehrId = kreirajEHRvzorec('Snoop', 'Dogg', '1972-01-12T08:13');

            for (var i = 0; i < 10; i++) {
                var random = Math.round((Math.random() * 100) + 1);
                dateTime = new Date(1990 + i, (5 + random) % 3 + 3, 4, (13 + random * random) % 24, (20 + random) % 24);
                dodajPodatkeVzorca(ehrId, {
                    datum: dateTime.toISOString().substring(0, 16),
                    visina: heights[0][i],
                    teza: mass[0][i],
                    sistolicni: sisTlak[0][i],
                    diastolicni: diaTlak[0][i],
                    merilec: 'Doktor Zdravko'
                });
            }
            break;
        case 2:
            ehrId = kreirajEHRvzorec('Donald', 'Trump', '1946-07-12T13:34');


            for (var i = 0; i < 10; i++) {
                var random = Math.round((Math.random() * 100) + 1);
                dateTime = new Date(1995 + i, (4 + random) % 3 + 3, 10, (9 + random * random) % 24, (50 + random) % 24);
                dodajPodatkeVzorca(ehrId, {
                    datum: dateTime.toISOString().substring(0, 16),
                    visina: heights[1][i],
                    teza: mass[1][i],
                    sistolicni: sisTlak[1][i],
                    diastolicni: diaTlak[1][i],
                    merilec: 'Doktor Zdravko'
                });
            }
            break;
        case 3:
            ehrId = kreirajEHRvzorec('Janja', 'Novak', '1993-03-08T11:45')


            for (var i = 0; i < 10; i++) {
                var random = Math.round((Math.random() * 100) + 1);
                dateTime = new Date(1992 + i, (1 + random) % 3 + 3, 15, (17 + random * random) % 24, (35 + random) % 24);
                dodajPodatkeVzorca(ehrId, {
                    datum: dateTime.toISOString().substring(0, 16),
                    visina: heights[2][i],
                    teza: mass[2][i],
                    sistolicni: sisTlak[2][i],
                    diastolicni: diaTlak[2][i],
                    merilec: 'Doktor Zdravko'
                });
            }
            break;

            /**
             *  7bcc96d8-bf97-46a9-a734-f91de6016097 -> Snoop Dogg
             *  850dff54-a4de-465f-ab79-58eb2db0f578 -> Donald Trump
             *  0f2f4363-2819-4031-bb8a-4f96edcedc8d -> Janja Novak
             */
    }


    console.log(ehrId + "->" + stPacienta);
    return ehrId;
}

function generirajVzorec() {
    generirajPodatke(1);
    generirajPodatke(2);
    generirajPodatke(3);
}

function kreirajEHRvzorec(ime, priimek, datumRojstva) {
    sessionId = getSessionId();
    $.ajaxSetup({
        headers: {
            "Ehr-Session": sessionId
        }
    })
    var odgovor = $.ajax({
        url: baseUrl + '/ehr',
        async: false,
        type: 'POST',
        success: function(podatki) {
            var ehrId = podatki.ehrId;
            var partyData = {
                firstNames: ime,
                lastNames: priimek,
                dateOfBirth: datumRojstva,
                partyAdditionalInfo: [{
                    key: "ehrId",
                    value: ehrId
                }]
            };
            $.ajax({
                url: baseUrl + "/demographics/party",
                type: 'POST',
                contentType: 'application/json',
                podatki: JSON.stringify(partyData),
                success: function(party) {
                    $('#kreirajOpozorilo').text('Uspešno kreiran EHR ID za: ' + ime + ' ' + priimek + ' (' + ehrId + ')');
                    $('#addEHR').val(ehrId);
                    $('#preberiEHR').val(ehrId);
                },
                error: function(err) {
                    $('#kreirajOpozorilo').text('Napaka!');
                }
            });
        }
    });
    return odgovor.odgovorJSON.ehrId;
}

function kreirajEHRpacienta() {
    $('#addEhrId').val(kreirajEHRvzorec($('#createIme').val(), $('#createPriimek').val(), $('#createRojstvo').val()));
    $('#createIme').val('');
    $('#createPriimek').val('');
    $('#createRojstvo').val('');
}

function preberiZgodovino() {
    sessionId = getSessionId();

    var ehrId = $("#preberiEHR").val();
    $('#podatkiPacienta tbody').empty();

    if (!ehrId || ehrId.trim().length == 0) {
        $("#opozoriloBranja").html("<span class='obvestilo " +
            "label label-warning fade-in'>Prosim vnesite EHR ID!");
    }
    else {
        $.ajax({
            url: baseUrl + "/view/" + ehrId + "/" + "blood_pressure?" + $.param({
                limit: 25
            }),
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(tlaki) {
                $.ajax({
                    url: baseUrl + "/view/" + ehrId + "/" + "weight",
                    type: 'GET',
                    headers: {
                        "Ehr-Session": sessionId
                    },
                    success: function(res) {
                        if (res.length > 0) {
                            var zaGraf = [];
                            var results = "<table class='table table-striped table-hover>";
                            for (var i = 0; i < res.length; i++) {
                                results =
                                    ' \
                                    <tr> \
                                    <th scope="row">' + (i + 1) + '</td> \
                                    <td>' + tlaki[i].time.substring(0, 16) + '</td> \
                                    <td>' + tlaki[i].systolic + '/' + tlaki[i].diastolic + '<span style="margin-left: 10px; color:#999"></span></td> \
                                    <td>' + res[i].weight + ' ' + res[i].unit + '</td> \
                                    </tr> '
                                results += "</table>";
                                $("#podatkiPacienta tbody").append(results);
                                zaGraf.push(tlaki[i].systolic);
                                
                            }
                            console.log(zaGraf);
                            Array.prototype.max = function() {
                                return Math.max.apply(null, this);
                            };

                            if (zaGraf.max() > 139) {
                                $("#bolnice").toggle("normal");
                            }
                            narisiGraf(zaGraf);
                        }
                        else {
                            $("#opozoriloBranja").html(
                                "<span class='obvestilo label label-warning fade-in'>" +
                                "Ni podatkov za pacienta!</span>");
                        }
                    },
                    error: function() {
                        console.log("Napaka!")
                    }
                });
            },
            error: function() {
                console.log("Napaka!")
            }
        });
    }
}

function dodajPodatkeVzorca(ehrId, podatki) {
    var sessionId = getSessionId();
    $.ajaxSetup({
        headers: {
            "Ehr-Session": sessionId
        }
    });
    var podatki = {
        "ctx/language": "en",
        "ctx/territory": "SI",
        "ctx/time": podatki.datum,
        "vital_signs/height_length/any_event/body_height_length": podatki.visina,
        "vital_signs/body_weight/any_event/body_weight": podatki.teza,
        "vital_signs/blood_pressure/any_event/systolic": podatki.sistolicni,
        "vital_signs/blood_pressure/any_event/diastolic": podatki.diastolicni,

    };
    var parametriZahteve = {
        ehrId: ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT',
        committer: podatki.merilec
    };
    $.ajax({
        url: baseUrl + "/composition?" + $.param(parametriZahteve),
        type: 'POST',
        contentType: 'application/json',
        podatki: JSON.stringify(podatki),
        success: function(odgovor) {
            $('#dodajOpozorilo').text('Podatki so dodani');
        },
        error: function(err) {
            $('#dodajOpozorilo').text('Napaka! Popravite podatke');
        }
    });
}

function dodajPodatkeVzorcaGumb() {
    var date = new Date();
    dodajPodatkeVzorca($('#addEHR').val(), {
        datum: date.toISOString(),
        visina: $('#addVisina').val(),
        teza: $('#addTeza').val(),
        sistolicni: $('#addSistolicni').val(),
        diastolicni: $('#addDiastolicni').val(),
        merilec: 'Trenutni uporabnik'
    });
    $('#addVisina').val('');
    $('#addTeza').val('');
    $('#addSistolicni').val('');
    $('#addDiastolicni').val('');
}

function narisiGraf(podatki) {
    $(function() {
        $('#prostorGraf').highcharts({
            title: {
                text: 'Graf krvnega pritiska',
                x: -20 //center
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
                ]
            },
            yAxis: {
                title: {
                    text: 'Tlak (mmHg)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: 'mmHg'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: [{
                name: 'Krvni tlak',
                podatki: podatki
            }]
        });
    });
}

function pridobiBolnice() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
                var location = {lat: position.coords.latitude, lng: position.coords.longitude};
                drawMap(location);
            }
        );
    }
    else {
        console.log("Ta brskalnik ne podpira geolokacije");
    }

}

function drawMap(location){
   
    var map, infowindow;

    function initMap(location) {
        map = new google.maps.Map(document.getElementById('google'), {
        	center: location,
        	zoom: 8
        });
 
        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        
        service.nearbySearch({
        	location: location,
          	radius: 10000,
          	type: ['hospital']
        }, callback);
  	}

  	function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
      		for (var i = 0; i < results.length; i++) {
    			createMarker(results[i]);
      		}
        }
  	}

  	function createMarker(place) {
    	var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
      		map: map,
          	position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
        	infowindow.setContent(place.name);
          	infowindow.open(map, this);
        });
  	}
  	
  	initMap(location);
}

$(window).load(function() {
    $("#addIzbiroEHR").change(function() {
        // console.log($('#dodajanje_selectEhrId').val());
        $('#addEHR').val($('#addIzbiroEHR').val());
    });
    $("#preberiIzbiroEHR").change(function() {
        // console.log($('#branje_selectEhrId').val());
        $('#preberiEHR').val($('#preberiIzbiroEHR').val());
    });

});