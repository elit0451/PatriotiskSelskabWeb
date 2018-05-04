var app = angular.module('mainApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider

    .when('/', {
        templateUrl : 'main.html',
        controller : 'mainController'
    })

    .when('/year/:year', {
        templateUrl : 'year.html',
        controller : 'yearController'
    })

    .when('/block/:blockID', {
        templateUrl : 'block.html',
        controller : 'blockController'
    })

    .when('/subBlock/:subBlockID', {
        templateUrl : 'subBlock.html',
        controller : 'subBlockController'
    })

    .when('/trialGroup/:trialGroupID', {
        templateUrl : 'trialGroup.html',
        controller : 'trialGroupController'
    })
    
    .otherwise({
        controller : function(){
            window.location.replace('/');
        }, 
        template : "<div></div>"
    });
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

app.controller('mainController', function($rootScope, $scope, $http){

    $http.get("data/FieldBlocks.json")
  .then(function(response) {
    $rootScope.FieldBlocks = response.data;
  });
    
});

app.controller('yearController', function($scope, $routeParams, $rootScope, $http){
    $rootScope.selectedFieldBlockYear = $routeParams.year;
    $http.get("data/SubBlocks.json")
  .then(function(response) {
    $rootScope.SubBlocks = response.data;
  });
});

app.controller('blockController', function($scope, $routeParams, $http, $rootScope){
    angular.forEach($rootScope.FieldBlocks, function(value, key){
        if(value.FieldBlockID == $routeParams.blockID){
            $scope.FieldBlock = value;
        }
    });
    
    $rootScope.selectedFieldBlockChar = $scope.FieldBlock.BlockChar;
    $rootScope.selectedFieldBlockID = $scope.FieldBlock.FieldBlockID;
});

app.controller('subBlockController', function($scope, $rootScope, $routeParams, $http){
    $scope.TrialGroups = [];
    
    $http.get("data/TrialGroups.json")
    .then(function(response) {
        $rootScope.TrialGroups = response.data;
        $http.get("data/Treatment.json")
        .then(function(response) {
            $rootScope.Treatments = response.data;

            angular.forEach($rootScope.TrialGroups, function(value, key){
                if($routeParams.subBlockID == value.SubBlockID){
                    $scope.TrialGroups.push(value);
                }
            });

            angular.forEach($scope.TrialGroups, function(value, key){
                value.Treatment = [];
                value.LogChemName = "";
                value.LogChemDosages = [];
                angular.forEach($rootScope.Treatments, function(treatmentValue, treatmentKey){
                    if(value.TrialGroupID == treatmentValue.TrialGroupID){
                        value.Treatment.push(treatmentValue);
                        if(treatmentValue.DoseLog === true)
                        {
                            value.LogChemName = treatmentValue.ProductName;
                            value.LogChemDosages.push(treatmentValue.ProductDose);
                        }
                }
                value.LogChemDosages = value.LogChemDosages.sort().reverse();
            });
        });
    });
});

    angular.forEach($rootScope.SubBlocks, function(value, key){
        if(value.SubBlockID == $routeParams.subBlockID){
            $scope.SubBlock = value;
        }
    });


    $rootScope.selectedSubBlockChar = $scope.SubBlock.SubBlockChar;
    $rootScope.selectedSubBlockID = $scope.SubBlock.SubBlockID; 
});

app.controller('trialGroupController', function($scope, $rootScope, $routeParams, $http){
        $scope.TrialGroup = response.data;
        $rootScope.selectedTrialGroup = $scope.TrialGroup.TrialGroupID;
});