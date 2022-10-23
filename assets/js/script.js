const apiKey = "604cd5f925465b3056536dc73b75de09"

// pull in typed city name
// translate city name to latitude and longitude
    // get request or api
// fetch request to get current date forecast data
// 

// s of 6:12pm on 10/22 the call gets a 401 error, unauthorized?

function findCity() {
    var cityName = titleCase($("#cityName")[0].value.trim());
    cityName = cityName.trim()
    debugger;
    var apiURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&exclude=minutely,hourly&units=imperial&appid=" + apiKey;

    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {

                $("#city-name")[0].textContent = cityName + " (" + moment().format('M/D/YYYY') + ")";

                $("#city-list").append('<button type="button" class="list-group-item list-group-item-light list-group-item-action city-name">' + cityName);

                const lat = data.city.coord.lat;
                const lon = data.city.coord.lon;

                var latLonPair = lat.toString() + " " + lon.toString();

                localStorage.setItem(cityName, latLonPair);

                apiURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=imperial&appid=" + apiKey;

                fetch(apiURL).then(function (newResponse) {
                    if (newResponse.ok) {
                        newResponse.json().then(function (newData) {
                            getCurrentWeather(newData);
                        })
                    }
                })
            })
        } else {
            alert("Cannot find city!");
        }
    })
}

// This function gets the info for a city already in the list. It does not need to check whether the city exists as it was already checked when the city was first searched for.
function getListCity(coordinates) {
    apiURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + coordinates[0] + "&lon=" + coordinates[1] + "&exclude=minutely,hourly&units=imperial&appid=" + apiKey;
    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                getCurrentWeather(data);
            })
        }
    })
}

function getCurrentWeather(data) {
    $(".results-panel").addClass("visible");
    
    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + ".png";

    $("#min-temperature")[0].textContent = "Low Temperature: " + data.list[0].main.temp_min + " \u2109";
    $("#max-temperature")[0].textContent = "High Temperature: " + data.list[0].main.temp_max + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.list[0].main.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.list[0].wind.speed + " MPH";

    getFutureWeather(data);
}

// entire function needs recheck due to 3 hour forecast, 0, 7, 14, 21, 28, 35 as 8 works but 0, 8, 16, 24, 32, 39 won't
function getFutureWeather(data) {
    for (let i = 0; i < 5; i++) {
        var fDate = 0;
        
        switch(i) {
            case 0:
                fDate = 8;
                break;
            case 1:
                fDate = 16;
                break;
            case 2:
                fDate = 24;
                break;
            case 3:
                fDate = 32;
                break;
            case 4:
                fDate = 39;
                break;
        }
        
        var futureWeather = {
            date: moment(data.list[fDate].dt_txt).format("M-D-YYYY"),
            icon: "http://openweathermap.org/img/wn/" + data.list[fDate].weather[0].icon + ".png",
            minTemp: data.list[fDate].main.temp_min + " \u2109",
            maxTemp: data.list[fDate].main.temp_max + " \u2109",
            humidity: data.list[fDate].main.humidity
        }

        var currentSelector = "#day-" + i;
        $(currentSelector)[0].textContent = futureWeather.date;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = futureWeather.icon;
        currentSelector = "#min-temp-" + i;
        $(currentSelector)[0].textContent = "Low Temp: " + futureWeather.minTemp + " \u2109";
        currentSelector = "#max-temp-" + i;
        $(currentSelector)[0].textContent = "High Temp: " + futureWeather.maxTemp + " \u2109";
        currentSelector = "#hum-" + i;
        $(currentSelector)[0].textContent = "Humidity: " + futureWeather.humidity + "%";
    }
}

// This function applies title case to a city name if there is more than one word.
function titleCase(city) {
    var updatedCity = city.toLowerCase().split(" ");
    var returnedCity = "";
    for (var i = 0; i < updatedCity.length; i++) {
        updatedCity[i] = updatedCity[i][0].toUpperCase() + updatedCity[i].slice(1);
        returnedCity += " " + updatedCity[i];
    }
    return returnedCity;
}

// This converts the UNIX time that is received from the server.
function convertUnixTime(data, index) {
    const dateObject = new Date(data.daily[index + 1].dt * 1000);

    return (dateObject.toLocaleDateString());
}

$("#search-button").on("click", function (event) {
    event.preventDefault();

    findCity();

    $("form")[0].reset();
})

$("#del-button").on("click", function (event) {
    event.preventDefault();

    localStorage.clear();
    location.reload();
})

$(".city-list-box").on("click", ".city-name", function () {

    var coordinates = (localStorage.getItem($(this)[0].textContent)).split(" ");
    coordinates[0] = parseFloat(coordinates[0]);
    coordinates[1] = parseFloat(coordinates[1]);

    $("#city-name")[0].textContent = $(this)[0].textContent + " (" + moment().format('M/D/YYYY') + ")";

    getListCity(coordinates);
})