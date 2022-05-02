import { cities } from "./cities.js";

const apiKey = "";

const form = document.querySelector(".form");
const search = document.querySelector(".search");

const fahrenheit = document.querySelector(".F");
const celsius = document.querySelector(".C");

//let submitted = false;
let searchedLocation = "";

const url = (location) => `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
const urlForecast = (lat, long) =>
  `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

async function getLocation(location) {
  const resp = await fetch(url(location), { origin: "cors" });
  const respData = await resp.json();

  getLocationForecast(respData.coord.lat, respData.coord.lon);

  addWeatherData(respData);

  console.log(respData);
}

async function getLocationForecast(lat, long) {
  const resp = await fetch(urlForecast(lat, long), { origin: "cors" });
  const respData = await resp.json();

  addForecastData(respData);
  console.log(respData);
}

async function getCities(location) {
  let proxyurl = "https://cors-anywhere.herokuapp.com/";
  const resp = await fetch(
    proxyurl + `https://www.google.com/search?q=${location}&tbm=isch`
  );
  const respData = await resp.text();

  let index = respData.indexOf(`a class="wXeWr islib nfEiy mM5pbd"`);

  console.log(respData.substring(index, index + 500));
}

function addWeatherData(data) {
  //set temp and location
  const temp = convertTemperature(data.main.temp);
  const tempText = document.querySelector(".temp-degree");
  tempText.innerHTML = temp + "°";
  const locationText = document.querySelector(".location-timezone");
  locationText.innerHTML = search.value;
  const descriptionText = document.querySelector(".description");
  descriptionText.innerHTML = data.weather[0].main;

  //set icon
  const icon = document.getElementById("icon");
  icon.innerHTML = `<img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="">`;
}

function addForecastData(data) {
  const forecast = document.querySelector(".forecast").children;
  console.log(forecast);
  for (let i = 0; i < forecast.length; i++) {
    let date = new Date(data.daily[i + 1].dt * 1000)
      .toLocaleDateString("en-US", { weekday: "long" })
      .substring(0, 3);
    let temp = convertTemperature(data.daily[i + 1].temp.day);
    forecast[i].children[0].innerHTML = date;
    forecast[i].children[2].innerHTML = temp + "°";
    const icon = document.getElementById("icon" + (i + 1).toString());
    icon.innerHTML = `<img src="http://openweathermap.org/img/w/${
      data.daily[i + 1].weather[0].icon
    }.png" alt="">`;
  }
}

function convertTemperature(K) {
  if (fahrenheit.value === "On") {
    return Math.floor(((K - 273.15) * 9) / 5 + 32);
  } else return Math.floor(K - 273.15);
}

fahrenheit.addEventListener("click", (e) => {
  e.preventDefault();
  if (fahrenheit.value === "Off") {
    fahrenheit.value = "On";
    celsius.value = "Off";
    if (searchedLocation != "" && searchedLocation === search.value.trim()) {
      getLocation(search.value);
    }
  }
});

celsius.addEventListener("click", (e) => {
  e.preventDefault();
  if (celsius.value === "Off") {
    celsius.value = "On";
    fahrenheit.value = "Off";
    if (searchedLocation != "" && searchedLocation === search.value.trim()) {
      getLocation(search.value);
    }
  }
});

function autocomplete(input, arr) {
  let total = 0;
  let currentFocus;
  input.addEventListener("input", function (e) {
    let a,
      b,
      i,
      val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("div");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (total >= 10) {
        total = 0;
        return;
      }
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        b = document.createElement("div");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function (e) {
          input.value = this.getElementsByTagName("input")[0].value;
          const location = input.value;
          if (location) {
            getLocation(location);
            searchedLocation = location;
            //submitted = true;
          }
          closeAllLists();
          total = 0;
        });
        a.appendChild(b);
        total++;
      }
    }
  });
  input.addEventListener("keydown", function (e) {
    let x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 13) {
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != input) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const location = search.value;
    if (location) {
      getLocation(location);
      searchedLocation = location;
      //submitted = true;
      closeAllLists();
      total = 0;
    }
  });
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

autocomplete(document.getElementById("myInput"), cities);
