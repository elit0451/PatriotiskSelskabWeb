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


    $http.get("data/TrialTypes.json")
        .then(function (response) {
            angular.forEach(response.data, function (value, key) {
                $rootScope.trialTypes.push(value);
            });
        });

    $rootScope.trialTypeChange = function () {
        $rootScope.crops = [];

        $http.get("data/Crops.json")
            .then(function (response) {
                angular.forEach(response.data, function (value, key) {
                    if ($rootScope.selectedTrialType.TrialTypeID == value.TrialTypeID) {
                        $rootScope.crops.push(value);
                    }
                });
            });
    };

    $rootScope.cropChange = function () {
        $rootScope.years = [];

        if ($rootScope.selectedCrop != undefined) {
            $http.get("data/Years.json")
                .then(function (response) {
                    angular.forEach(response.data, function (value, key) {
                        if ($rootScope.selectedCrop.CropID == value.CropID) {
                            $rootScope.years.push(value);
                        }
                    });
                });
        }
    };

    $rootScope.search = function () {
        if ($rootScope.selectedTrialType != undefined && $rootScope.selectedCrop != undefined && $rootScope.selectedYear != undefined) {
            window.location.href = "#!/chemicals";
        }
    };

    $rootScope.LoadTrialTypes = function () {
        return $http.get("data/TrialTypes.json")
            .then(function (response) {
                $rootScope.TrialTypes = response.data;
            });
    };

    $rootScope.LoadCrops = function () {
        return $http.get("data/Crops.json")
            .then(function (response) {
                $rootScope.Crops = response.data;
            });
    };

    $rootScope.LoadYears = function () {
        return $http.get("data/Years.json")
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

    $rootScope.LoadTrialGroups = function () {
        return $http.get("data/TrialGroups.json")
            .then(function (response) {
                $rootScope.TrialGroups = response.data;
            });
    };

    $rootScope.LoadTreatments = function () {
        return $http.get("data/Treatments.json")
            .then(function (response) {
                $rootScope.Treatments = response.data;
            });
    };
}]);

app.controller('mainController', function ($rootScope, $scope, $http) {
    $scope.topResults = [];
    $rootScope.selectedTrialType = undefined;
    $rootScope.selectedCrop = undefined;
    $rootScope.selectedYear = undefined;
    $rootScope.crops = undefined;
    $rootScope.years = undefined;

    $http.get("data/TopTypeResults.json")
        .then(function (response) {
            angular.forEach(response.data, function (value, key) {
                $scope.topResults.push(value);
            });
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

    if ($rootScope.TrialGroups == undefined) {
        promises.push($rootScope.LoadTrialGroups());
    }

    if ($rootScope.Treatments == undefined) {
        promises.push($rootScope.LoadTreatments());
    }

    $q.all(promises).then(function () {
        var flag = false;

        angular.forEach($rootScope.TrialGroups, function (value, key) {
            value.Treatments = [];
            value.LogChemName = "";
            value.LogChemDosages = [];

            if (value.TrialGroupID == $routeParams.trialGroupID) {
                $scope.trialGroup = value;
                flag = true;

                angular.forEach($rootScope.Treatments, function (treatmentValue, treatmentKey) {
                    if (treatmentValue.TrialGroupID == $scope.trialGroup.TrialGroupID) {
                        $scope.trialGroup.Treatments.push(treatmentValue);
                        if (treatmentValue.DoseLog === true) {
                            $scope.trialGroup.LogChemName = treatmentValue.ProductName;
                            $scope.trialGroup.LogChemDosages.push(treatmentValue.ProductDose);
                        }
                    }
                    $scope.trialGroup.LogChemDosages = $scope.trialGroup.LogChemDosages.sort().reverse();
                });

                angular.forEach($scope.trialGroup.Treatments, function (value, key) {

                    var found = $scope.Stages.some(function (el) {
                        return el.id === value.TreatmentID;
                    });

                    if (!found) {
                        $scope.Stages.push({ id: value.TreatmentID, stageName: value.TreatmentStage, stageDate: value.TreatmentDate, stageComment: value.Comment, products: [] });
                    }

                    angular.forEach($scope.Stages, function (stageValue, stageKey) {
                        if (stageValue.id == value.TreatmentID) {
                            var dose;

                            if (value.DoseLog == true) dose = "LOG";
                            else dose = value.ProductDose;

                            found = stageValue.products.some(function (el) {
                                return el.productName === value.ProductName;
                            });

                            if (!found)
                                stageValue.products.push({ productName: value.ProductName, dosage: dose });
                        }
                    });

                });
            }
        });

        if (flag == false) {
            window.location.href = "#!/";
        }
        else {
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
        }

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