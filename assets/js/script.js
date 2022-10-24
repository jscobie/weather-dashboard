const apiKey = "604cd5f925465b3056536dc73b75de09"

// Using the input form get weather using a fetch request of city name to coordinates,
// set the City to local storage (coordinates) and make the City button,
// then fetch the data for the forecast
function getCity() {
    var cityName = titleCase($("#cityName")[0].value.trim());
    cityName = cityName.trim()
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
            // If city name is not in list on Open Weather Map, show error/alert
            alert("Cannot find city!");
        }
    })
}

// Using the coordinates of the city stored in local storage on button creation pull up the weather
function getListCity(coordinates) {
    apiURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + coordinates[0] + "&lon=" + coordinates[1] + "&exclude=minutely,hourly&units=imperial&appid=" + apiKey;
    fetch(apiURL).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                // on response of data begin the functions for populating forecast
                getCurrentWeather(data);
            })
        }
    })
}

// This function uses the fetched data to populate the current forecast (and make visible all forecast elements)
function getCurrentWeather(data) {
    $(".results-panel").addClass("visible");
    
    $("#currentIcon")[0].src = "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png";

    $("#min-temperature")[0].textContent = "Low Temperature: " + data.list[0].main.temp_min + " \u2109";
    $("#max-temperature")[0].textContent = "High Temperature: " + data.list[0].main.temp_max + " \u2109";
    $("#humidity")[0].textContent = "Humidity: " + data.list[0].main.humidity + "% ";
    $("#wind-speed")[0].textContent = "Wind Speed: " + data.list[0].wind.speed + " MPH";

    // Calls the future weather forecast function
    getFutureWeather(data);
}

// This function handles placing the data pulled in getCurrentWeather for the future 5 day forecast blocks
function getFutureWeather(data) {
    for (let i = 0; i < 5; i++) {
        var fDate = 0;
        
        // this is used to step through the 0-39 results to get the next date and forecast info
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
        
        // build object of fDate (day to use) for populating
        var futureWeather = {
            date: moment(data.list[fDate].dt_txt).format("M-D-YYYY"),
            icon: "http://openweathermap.org/img/wn/" + data.list[fDate].weather[0].icon + ".png",
            maxTemp: data.list[fDate].main.temp_max + " \u2109",
            humidity: data.list[fDate].main.humidity
        }

        // populate object items into correct html/css elements
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

// This is the search button event listener, on press it runs the getCity function to populate forecase
$("#search-button").on("click", function (event) {
    event.preventDefault();

    getCity();

    $("form")[0].reset();
})

// Clear List button listener to clear local storage and reload the page
$("#del-button").on("click", function (event) {
    event.preventDefault();

    localStorage.clear();
    location.reload();
})

// This is a button listener for the remembered cities in the list and processes the call to pull weather
// from data in localstorage when the button was created.
$(".city-list-box").on("click", ".city-name", function () {
    var coordinates = (localStorage.getItem($(this)[0].textContent)).split(" ");
    coordinates[0] = parseFloat(coordinates[0]);
    coordinates[1] = parseFloat(coordinates[1]);

    $("#city-name")[0].textContent = $(this)[0].textContent + " (" + moment().format('M/D/YYYY') + ")";

    getListCity(coordinates);
})