//jshint esversion: 6
// last update 22/1/2022
var today = new Date();

const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

today = today.toLocaleDateString("en-us", options);
document.querySelector("#client-date").innerHTML = today;

var i=0;
let clicks = 0;
while (i<document.querySelectorAll(".check").length){
    document.querySelectorAll(".check")[i].addEventListener("click", function(){
      clicks++;
      if (clicks===document.querySelectorAll(".check").length){
        alert("Good Job! You have completed all existing tasks.");
      }
    });
    i++;
  }
