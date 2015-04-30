
$(document).ready(function(){
  $('.carousel').carousel({
    interval: false
  });
});


angular.module('smartShopper', ["chart.js"])
  .controller('GroceryController', ['$scope', function($scope, ModalService) {
    // $scope.items = [
    //   {fields:{item_name:'ice cream', bought: true, quantity: 3}},
    //   {fields:{item_name:'milk', bought: false, quantity: 5}}
    // ];
    // $scope.searchResults = [
    //   {fields:{item_name: 'cheese'}},
    //   {fields:{item_name: 'broccoli'}}
    // ];

       $scope.setupID = function () {
      if ($scope.id) {
        //get all groceries
        $.ajax({
              type: "GET",
              url: "https://grocery-server.herokuapp.com/getGrocery/",
              data: {
                "login" : $scope.id
              }
            })
            .done (function(data, status){
                $scope.alldata = data;
                $scope.initializeGraphs();
                $scope.$digest();
            })
            .fail (function (response,status){
               console.log(status)
               bootbox.alert("setupid Server Down!");
            });

      } else {
          console.log("No localstorage ID");
          $scope.getUID(); 
      }
      
      console.log($scope.id);
      console.log(radar_labels);

      // $scope.data1 = [
      //   [1, 2, 5, 2, 7],
      //   [5, 3, 4, 2, 8]
      // ];

      // $scope.labels1 = ["a", "b", "c", "d", "e"];



    }
   

    $scope.getUID = function() {
      $.ajax({
            type: "GET",
            timeout: 10000, 
            url: "http://grocery-server.herokuapp.com/getUID/",
          })
      .done (function(uid, status){
          localStorage.setItem("id", uid);
          $scope.id = uid;
          console.log("GOT NEW ID");
          console.log($scope.id);
          $scope.initializeGraphs();
          // $scope.updateGraphs();
          // $scope.$digest;
          $scope.$digest;
      })
      .fail (function (response,status){
         bootbox.alert("getuid Server Down!");
      });

    };

    //Initialization

    if (location.search.substring('?').split('=').length == 2 && location.search.substring('?').split('=')[0] == '?uid') {
      $.ajax({
            type: "GET",
            url: "https://grocery-server.herokuapp.com/checkUID/",
            data: {
              "login" : location.search.substring('?').split('=')[1]
            }
          })
          .done (function(data, status){
              if (data == "1") {
                //valid id
                $scope.id = location.search.substring('?').split('=')[1];
                localStorage.setItem("id", $scope.id);
              } 
              else {
                bootbox.alert("Oops! That's not a valid link. Check the link and try again!");
                $scope.id = localStorage.getItem("id");
              }
              $scope.setupID();
          })
          .fail (function (response,status){
             bootbox.alert("init Server Down!");
      });
    } else {
      console.log("No ID in URL");
      $scope.id = localStorage.getItem("id");
      $scope.setupID();
    }
    
    $scope.search = function() {
      console.log("SEARCH");
      var query = document.getElementById("grocItem").value;
      //$scope.getTotals(query);
      $.ajax({
            type: "POST",
            url: "http://grocery-server.herokuapp.com/addGrocery/",
            data: {login: $scope.id, grocery: query},
            dataType: "text"
          })
      .done (function(response, status){
        alldata = JSON.parse(response);
        if (alldata.error == null){
          if (alldata == "{}") {
            bootbox.alert("Please enter an item!");
          } else {
            $scope.alldata = alldata;
            console.log('all data');
            console.log(alldata);
            $scope.updateGraphs();
            $scope.$digest();
          }
          document.getElementById("grocItem").value = '';
        }
        else {
          bootbox.alert("No results found!");
        }
        
      })
      .fail (function (response,status){
         bootbox.alert("search Server Down!");
      });
      document.getElementById("grocItem").value = '';

    };

    // $scope.getTotals = function(query) {
    //   var allitemstr = query + "\n";
    //   if ($scope.alldata.results) {
    //     for (var i = 0; i < $scope.alldata.results.length; i++) {
    //     allitemstr += $scope.alldata.results[i].parsed_query.query + "\n";
    //     }
    //   }

    //   var appId = "feab83eb";
    //   var appKey = "ecc75d64bf6a77ba3f03d478d4ee943e";
    //   //search Nutritionix for search results...

    //   $.ajax({
    //         type: "POST",
    //         url: "https://grocery-server.herokuapp.com/addGrocery/",
    //         data: {login: uid, grocery: allitemstr},
    //         dataType: "text"
    //       })
    //   .done (function(response, status){
    //     alldata = JSON.parse(response);
    //     if (alldata.errors == null){
    //       $scope.alldata = alldata;
    //       $scope.updateGraphs();
    //       $scope.$digest();
    //       document.getElementById("grocItem").value = '';
    //     }
    //     else {
    //       bootbox.alert("No results found!");
    //     }
        
    //   })
    //   .fail (function (response,status){
    //      bootbox.alert("Server Down!");
    //   });
      // xmlhttp = new XMLHttpRequest();
      // xmlhttp.open("POST","https://api.nutritionix.com/v2/natural/",true);
      // xmlhttp.setRequestHeader("X-APP-ID", appId);
      // xmlhttp.setRequestHeader("X-APP-KEY", appKey);
      // xmlhttp.setRequestHeader("Content-Type", "text/plain");
      //   if (xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status == 200){
      //     alldata = JSON.parse(xmlhttp.responseText);

      //     // $scope.alldata = $scope.alldata.map(function(data) {
      //     //   return data.map(function (y) {
      //     //     console.log(y);
      //     //     return y;
      //     //   });
      //     // });


      //     $scope.alldata = alldata;
      //     $scope.updateGraphs();
      //     $scope.$digest();
      //     document.getElementById("grocItem").value = '';
      //     localStorage.setItem("grocery", JSON.stringify($scope.alldata));
      //   } else if (xmlhttp && xmlhttp.readyState == 4 && xmlhttp.status == 400){
      //       bootbox.alert("No results found!");
      //       return;
      //   }
    // };

    $scope.sendtophone = function(){
      bootbox.prompt("Please enter your phone number", function(result) {
        if (result === null) {

        }
        else {
          var allitemstr = '';
          if ($scope.alldata.results) {
           for (var i = 0; i < $scope.alldata.results.length; i++) {
              allitemstr += $scope.alldata.results[i].parsed_query.query + "\n";
            }
          }
          $.ajax({
            type: "POST",
            url: "http://textbelt.com/text",
            data: {number:result, message:allitemstr},
            success: bootbox.alert("Message Sent!"),
            dataType: "text"
          });
        }
        
      });
      
    };

    $scope.initializeGraphs = function() {
      console.log("INITIALIZE GRAPHS");


      $scope.radarColors = [
        {
          fillColor: 'rgba(220,220,220,.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
        }, 
        {
          fillColor: 'rgba(151,187,205,.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(151,187,205,1)",
        }
      ];

      $scope.radarOptions = {
        scaleShowLabels : false,
        // legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
      }

      $scope.radarSeries = ["Balanced Diet", "Your Diet"];


      $scope.data1 = [[],[]];
      $scope.labels1 = [];
      $scope.nutrients1 = [];
      var radar1size = 5;

      $scope.data2 = [[],[]];
      $scope.labels2 = [];
      $scope.nutrients2 = [];
      var radar2size = 5;

      $scope.data3 = [[],[]];
      $scope.labels3 = [];
      $scope.nutrients3 = [];
      var radar3size = 6;
      
      for (var i = 0; i < radar_labels.length; i++) {
        if (i < radar1size) {
          $scope.nutrients1[i] = radar_labels[i];
          $scope.labels1[i] = radar_labels[i].name + ", " + radar_labels[i].unit;
        }
        else if (i < radar1size + radar2size) {
          $scope.nutrients2[i - radar1size] = radar_labels[i];
          $scope.labels2[i - radar1size] = radar_labels[i].name + ", " + radar_labels[i].unit;
        }
        else if (i < radar1size + radar2size + radar3size) {
          var offset = radar2size + radar3size;
          $scope.nutrients3[i - offset] = radar_labels[i];
          $scope.labels3[i - offset] = radar_labels[i].name + ", " + radar_labels[i].unit;
        }

      }

      $scope.data = [];
      $scope.labels = [];
      for (var i = 0; i < 860; i++) {
        $scope.data[i] = 0;
        $scope.labels[i] = "";
      }

      for (var i = 0; i < nutrient_labels.length; i++) {
        current = nutrient_labels[i];
        $scope.labels[current.id] = current.name;
      }

      $scope.options = {
        animationEasing: "easeOutQuart",
        segmentShowStroke: false,
        responsive: true,
      };
      if ($scope.alldata != null && $scope.alldata.total != null){
        $scope.updateGraphs();
        console.log('ah');
      }
      // $scope.$apply;
      $scope.$digest;
    };

    $scope.updateGraphs = function(){
      console.log("UPDATE GRAPHS");
      if ($scope.alldata && $scope.alldata.total) {
        $scope.data1 = updateRadar($scope.alldata.total.nutrients, $scope.data1, $scope.nutrients1);
        $scope.data2 = updateRadar($scope.alldata.total.nutrients, $scope.data2, $scope.nutrients2);
        $scope.data3 = updateRadar($scope.alldata.total.nutrients, $scope.data3, $scope.nutrients3);
        updateDoughnut($scope.alldata.total.nutrients, "g", 0.3);
      } 
    };

    $scope.$on('$viewContentLoaded', function() {
      $scope.updateGraphs();
    });

    function updateRadar(nutrientsData, data, nutrients_to_use) {
      console.log("UPDATE RADAR");
      if (!nutrientsData) {
        //do something here to indicate no data and prompt to add data
        alert("NO DATA");
        return;
      }
      else {
        data = [[],[]];
        var totalCalories = -1;
        for (var i = 0; i < 7; i++) {
          if (nutrientsData[i].attr_id == 208) {
            totalCalories = nutrientsData[i].value;
            break;
          }
        }
        console.log("total calories: " + totalCalories);

        // create goal data and user's data
        for (var i = 0; i < nutrients_to_use.length; i++) {
          for (var j = 0; j < nutrientsData.length; j++) {
            if (nutrientsData[j].attr_id == nutrients_to_use[i].id) {
              var goalData = nutrients_to_use[i].ratio * totalCalories;
              var userData = nutrientsData[j].value / goalData;
              goalData = parseFloat((goalData).toFixed(2));
              userData = parseFloat((100*userData).toFixed(2));
              data[0].push(100);
              data[1].push(userData);
            }
          }
        }

        return data;

      }
    }

    function updateDoughnut(nutrientsData, unit, minValue) {
      // nutrientsData is an array, unit is a string, minValue is a float

      if (!nutrientsData) {
        //do something here to indicate no data and prompt to add data
        alert("NO DATA");
        return;
      }
      else {

        var id_index = -1;
        for (var i = 0; i < nutrientsData.length; i++) {
          if (nutrientsData[i].unit == unit && nutrientsData[i].value > minValue) {
            id_index = nutrientsData[i].attr_id;
            $scope.data[id_index] = parseFloat( (nutrientsData[i].value).toFixed(2) );
          }
        }



      }

    };
   


    $scope.deleteItem = function(idx) {
     $.ajax({
            type: "POST",
            url: "http://grocery-server.herokuapp.com/deleteGrocery/",
            data: {login: $scope.id, idx: idx},
            dataType: "text"
          })
      .done (function(response, status){
        alldata = JSON.parse(response);
        if (alldata.errors == null){
          $scope.alldata = alldata;
          $scope.updateGraphs();
          $scope.$digest();
          document.getElementById("grocItem").value = '';
        }
        else {
          bootbox.alert("No results found!");
        }
        
      })
      .fail (function (response,status){
         bootbox.alert("deleteitem Server Down!");
      });
      
    };


    $scope.voiceRec = function(){
      var recognition = new webkitSpeechRecognition();
      recognition.onresult = function(event) { 
        if (event.results[0].isFinal) {
            document.getElementById("grocItem").value = event.results[0][0].transcript;
        }
      }
      recognition.onerror = function(event){
          console.log("Error", event);   
      }
      recognition.start();
    };

    $scope.clearList = function() {
      $.ajax({
            type: "POST",
            url: "https://grocery-server.herokuapp.com/deleteAll/",
            data: {login: $scope.id},
            dataType: "text"
          })
      .done (function(response, status){
        alldata = JSON.parse(response);
        if (alldata.error == null){
          $scope.alldata = alldata;
          $scope.updateGraphs();
          $scope.$digest();
          document.getElementById("grocItem").value = '';
        }
        else {
          bootbox.alert("No results found!");
        }
        
      })
      .fail (function (response,status){
         bootbox.alert("clearlist Server Down!");
      });
    };

  }]);
