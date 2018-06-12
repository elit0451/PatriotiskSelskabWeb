var app = angular.module('mainApp', ['ngRoute']);


app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })

        .when('/trialGroup/:trialGroupID', {
            templateUrl: 'trialGroup.html',
            controller: 'trialGroupController'
        })

        .when('/chemicals', {
            templateUrl: 'chemicals.html',
            controller: 'chemicalController'
        });

});

app.run(['$rootScope', '$http', function ($rootScope, $http) {
    $rootScope.trialTypes = [];


    $http.get("http://localhost:50458/GetTrialTypes")
        .then(function (response) {
                $rootScope.trialTypes = response.data;
        });

    $rootScope.trialTypeChange = function () {
        $rootScope.crops = [];
        $http.get("http://localhost:50458/GetTrialTypeCrops/" + $rootScope.selectedTrialType.Id)
            .then(function (response) {
                $rootScope.crops = response.data;
                console.log(response.data);
            });
    };

    $rootScope.cropChange = function () {
        $rootScope.years = [];

        if ($rootScope.selectedCrop != undefined) {
            $http.get("http://localhost:50458/GetCropYears/" + $rootScope.selectedTrialType.Id + "/" + $rootScope.selectedCrop.ID)
                .then(function (response) {
                    $rootScope.years = response.data;
                });
        }
    };

    $rootScope.search = function () {
        if ($rootScope.selectedTrialType != undefined && $rootScope.selectedCrop != undefined && $rootScope.selectedYear != undefined) {
            window.location.href = "#!/chemicals";
        }
    };

    $rootScope.LoadTrialTypes = function () {
        return $http.get("http://localhost:50458/GetTrialTypes")
            .then(function (response) {
                $rootScope.TrialTypes = response.data;
            });
    };

    $rootScope.LoadCrops = function () {
        return $http.get("http://localhost:50458/GetAllWeeds")
            .then(function (response) {
                $rootScope.Crops = response.data;
            });
    };

    $rootScope.LoadYears = function () {
        return $http.get("http://localhost:50458/GetYears")
            .then(function (response) {
                $rootScope.Years = response.data;
            });
    };

    $rootScope.LoadTopResults = function () {
        return $http.get("data/TopTypeResults.json")
            .then(function (response) {
                $rootScope.TopResults = response.data;
            });
    };

    $rootScope.LoadTrialGroup = function (trialgroupid) {
        return $http.get("http://localhost:50458/GetTrialGroup/" + trialgroupid)
            .then(function (response) {
                console.log("Started gathering trialgroup");
                $rootScope.TrialGroup = response.data;
                $rootScope.TrialGroup.Treatments = [];
                $rootScope.TrialGroup.LogChemName = "";
                $rootScope.TrialGroup.LogChemDosages = [];
                console.log(response.data);
            });
    };

    $rootScope.LoadTrialGroupTreatments = function (trialgroupid) {
        return $http.get("http://localhost:50458/GetTrialGroupTreatments/" + trialgroupid)
            .then(function (response) {
                var treatments = response.data;
                angular.forEach(treatments, function (treatmentValue, treatmentKey) {
                    $rootScope.TrialGroup.Treatments.push(treatmentValue);
                    console.log(treatmentValue);
                    if (treatmentValue.DoseLog === true) {
                        $rootScope.TrialGroup.LogChemName = treatmentValue.ProductName;
                        $rootScope.TrialGroup.LogChemDosages.push(treatmentValue.ProductDose);
                    }
                    $rootScope.TrialGroup.LogChemDosages = $rootScope.TrialGroup.LogChemDosages.sort().reverse();
                });
            });
    }
}]);

app.controller('mainController', function ($rootScope, $scope, $http) {
    $scope.topResults = [];
    $rootScope.selectedTrialType = undefined;
    $rootScope.selectedCrop = undefined;
    $rootScope.selectedYear = undefined;
    $rootScope.crops = undefined;
    $rootScope.years = undefined;

    $http.get("http://localhost:50458/GetTopResults")
        .then(function (response) {
                $scope.topResults = response.data;
        });

});

app.filter('unique', function () {
    return function (collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    };
});

app.controller('trialGroupController', function ($rootScope, $scope, $http, $q, $routeParams) {
    var promises = [];
    $scope.Stages = [];
    $scope.SimilarTrialGroups = [];

    promises.push($rootScope.LoadTrialGroup($routeParams.trialGroupID));
    promises.push($rootScope.LoadTrialGroupTreatments($routeParams.trialGroupID));

    $q.all(promises).then(function () {
        if ($rootScope.TrialGroup == undefined) {
            window.location.href = "/";
        }

        angular.forEach($rootScope.TrialGroup.Treatments, function (value, key) {
            $scope.Stages.push({ id: value.TreatmentID, stageName: value.TreatmentStage, stageDate: value.TreatmentDate, stageComment: value.Comment, products: [] });

            angular.forEach($scope.Stages, function (stageValue, stageKey) {
                if (stageValue.id == value.TreatmentID) {
                    angular.forEach(value.Products, function (product, productKey) {
                        var dose;
                        if (product.DoseLog == true) dose = "LOG";
                        else dose = product.ProductDose;

                        found = stageValue.products.some(function (el) {
                            return el.productName === product.TrtProduct.Name;
                        });

                        if (!found)
                            stageValue.products.push({ productName: product.TrtProduct.Name, dosage: dose });
                    });
                }
            });

        });
            var similiarTrialGroups = [];
            angular.forEach($rootScope.TrialGroups, function (value, key) {
                if (value.TrialTypeName == $scope.trialGroup.TrialTypeName && value.TrialGroupID != $scope.trialGroup.TrialGroupID) {
                    value.treatments = [];
                    similiarTrialGroups.push(value);
                }
            });

            angular.forEach(similiarTrialGroups, function (value, key) {
                angular.forEach($rootScope.Treatments, function (treatmentValue, treatmentKey) {
                    if (value.TrialGroupID == treatmentValue.TrialGroupID) {
                        value.treatments.push(treatmentValue);
                    }
                });
            });

            angular.forEach(similiarTrialGroups, function (value, key) {
                var added = false;
                angular.forEach(value.treatments, function (treatmentValue, treatmentKey) {
                    if (treatmentValue.ProductName == $scope.trialGroup.LogChemName && added == false) {
                        $scope.SimilarTrialGroups.push({ trialID: value.TrialGroupID, cropName: value.CropName, chemName: treatmentValue.ProductName });
                        added = true;
                    }
                });
            });

    });
});

app.controller('chemicalController', function ($scope, $routeParams, $rootScope, $q) {
    var promises = [];
    $scope.matchedTrialGroups = [];
    $scope.chemicals = [];

    if ($rootScope.TrialGroups == undefined) {
        promises.push($rootScope.LoadTrialGroups());
    }

    if ($rootScope.Years == undefined) {
        promises.push($rootScope.LoadYears());
    }

    if ($rootScope.Treatments == undefined) {
        promises.push($rootScope.LoadTreatments());
    }

    if ($rootScope.years == undefined) {
        window.location.href = "#!/";
    }

    $scope.updateChemicals = function () {
        $scope.matchedTrialGroups = [];
        $scope.chemicals = [];

        if ($rootScope.selectedCrop != undefined && $rootScope.selectedYear != undefined) {
            $scope.trialTypeLink = $rootScope.selectedTrialType.TrialTypeName;
            $scope.cropLink = $rootScope.selectedCrop.CropName;
            $scope.yearLink = $rootScope.selectedYear.Year;
        }

        $q.all(promises).then(function () {
            angular.forEach($rootScope.TrialGroups, function (value, key) {
                var added = false;
                if ($rootScope.selectedTrialType != undefined) {
                    if (value.TrialTypeName == $rootScope.selectedTrialType.TrialTypeName && value.CropName == $rootScope.selectedCrop.CropName) {
                        angular.forEach($rootScope.Years, function (yearValue, yearKey) {
                            if (yearValue.TrialGroupID == value.TrialGroupID && yearValue.CropID == value.CropID && added == false && yearValue.Year == $rootScope.selectedYear.Year) {
                                $scope.matchedTrialGroups.push(value);
                                added = true;
                            }
                        });
                    }
                }
            });

            angular.forEach($scope.matchedTrialGroups, function (value, key) {
                var added = false;
                angular.forEach($scope.Treatments, function (treatmentValue, treatmentKey) {
                    if (value.TrialGroupID == treatmentValue.TrialGroupID && treatmentValue.DoseLog == true && added == false) {
                        $scope.chemicals.push({ trialGroupID: value.TrialGroupID, chemName: treatmentValue.ProductName });
                        added = true;
                    }
                });
            });
        });
    };

    $scope.search = function () {
        if ($rootScope.selectedTrialType != undefined && $rootScope.selectedCrop != undefined && $rootScope.selectedYear != undefined) {
            $scope.updateChemicals();
        }
    };

    $scope.updateChemicals();
});