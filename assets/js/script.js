const apiKey = "604cd5f925465b3056536dc73b75de09"

function getCity() {
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
    
    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png";

    $("#min-temperature")[0].textContent = "Low Temperature: " + data.list[0].main.temp_min + " \u2109";
    $("#max-temperature")[0].textContent = "High Temperature: " + data.list[0].main.temp_max + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.list[0].main.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.list[0].wind.speed + " MPH";

    getFutureWeather(data);
}

function getFutureWeather(data) {
    for (let i = 0; i < 5; i++) {
        var fDate = 0;
        
        switch(i) {
            case 0:
                fDate = 7;
                break;
            case 1:
                fDate = 14;
                break;
            case 2:
                fDate = 21;
                break;
            case 3:
                fDate = 28;
                break;
            case 4:
                fDate = 35;
                break;
        }
        
        var futureWeather = {
            date: moment(data.list[fDate].dt_txt).format("M-D-YYYY"),
            icon: "http://openweathermap.org/img/wn/" + data.list[fDate].weather[0].icon + ".png",
            maxTemp: data.list[fDate].main.temp_max + " \u2109",
            humidity: data.list[fDate].main.humidity
        }

        var currentSelector = "#day-" + i;
        $(currentSelector)[0].textContent = futureWeather.date;
        currentSelector = "#img-" + i;
        $(currentSelector)[0].src = futureWeather.icon;
        currentSelector = "#max-temp-" + i;
        $(currentSelector)[0].textContent = "High Temp: " + futureWeather.maxTemp;
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

$("#search-button").on("click", function (event) {
    event.preventDefault();

    getCity();

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