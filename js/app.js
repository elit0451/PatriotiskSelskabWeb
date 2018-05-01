var app = angular.module('mainApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider

    .when('/', {
        templateUrl : 'main.html',
        controller : 'mainController'
    })

    .when('/block', {
        templateUrl : 'year.html',
        controller : 'mainController'
    });

    $locationProvider.html5Mode(true);
});

app.filter('unique', function() {
    return function(collection, keyname) {
       var output = [], 
           keys = [];
       
       angular.forEach(collection, function(item) {
           var key = item[keyname];
           if(keys.indexOf(key) === -1) {
               keys.push(key); 
               output.push(item);
           }
       });
       return output;
    };
 });

app.controller('mainController', function($rootScope, $scope){
        $scope.setSelectedFieldBlockYear = function(newFieldBlock){
            $rootScope.selectedFieldBlockYear = newFieldBlock;
        };

    $scope.FieldBlocks = [
          {
            "FieldBlockID": "1",
            "BlockChar": "A",
            "FieldBlockYear": 2018,
            "FieldBlockLength": 270,
            "FieldBlockWidth": 320,
            "Comment": "This is a field comment"
          },
          {
            "FieldBlockID": "2",
            "BlockChar": "B",
            "FieldBlockYear": 2018,
            "FieldBlockLength": 640,
            "FieldBlockWidth": 110,
            "Comment": "This is a field comment"
          },
          {
            "FieldBlockID": "3",
            "BlockChar": "A",
            "FieldBlockYear": 2017,
            "FieldBlockLength": 640,
            "FieldBlockWidth": 110,
            "Comment": "This is a field comment"
          },
          {
            "FieldBlockID": "4",
            "BlockChar": "A",
            "FieldBlockYear": 2016,
            "FieldBlockLength": 239,
            "FieldBlockWidth": 320,
            "Comment": "This is a field comment"
          }
        ];
});