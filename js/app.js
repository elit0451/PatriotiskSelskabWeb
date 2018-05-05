var app = angular.module('mainApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider

        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })

        .when('/year/:year', {
            templateUrl: 'year.html',
            controller: 'yearController'
        })

        .when('/block/:blockID', {
            templateUrl: 'block.html',
            controller: 'blockController'
        })

        .when('/subBlock/:subBlockID', {
            templateUrl: 'subBlock.html',
            controller: 'subBlockController'
        })

        .when('/trialGroup/:trialGroupID', {
            templateUrl: 'trialGroup.html',
            controller: 'trialGroupController'
        })

        .when('/addYear/:year', {
            templateUrl: 'addYear.html',
            controller: 'addYearController'
        })

        .when('/addBlock', {
            templateUrl: 'addBlock.html',
            controller: 'addBlockController'
        })

        .when('/addSubBlock', {
            templateUrl: 'addSubBlock.html',
            controller: 'addSubBlockController'
        })

        .when('/addTrialGroup', {
            templateUrl: 'addTrialGroup.html',
            controller: 'addTrialGroupController'
        })

        .otherwise({
            controller: function () {
                window.location.replace('/');
            },
            template: "<div></div>"
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

app.run(['$rootScope', '$http', function ($rootScope, $http) {

    $rootScope.GetSubBlock = function (trialGroup) {
        var SubBlock;
        $http.get("data/SubBlocks.json")
            .then(function (response) {
                angular.forEach(response.data, function (value, key) {
                    if (trialGroup.SubBlockID == value.SubBlockID) {
                        $rootScope.selectedSubBlockChar = value.SubBlockChar;
                        $rootScope.selectedSubBlockID = value.SubBlockID;
                        SubBlock = value;
                    }
                });
                $rootScope.GetBlock(SubBlock);
            });
    };

    $rootScope.GetBlock = function (subBlock) {
        $http.get("data/FieldBlocks.json")
            .then(function (response) {
                angular.forEach(response.data, function (value, key) {
                    if (subBlock.FieldBlockID == value.FieldBlockID) {
                        $rootScope.selectedFieldBlockChar = value.BlockChar;
                        $rootScope.selectedFieldBlockID = value.FieldBlockID;
                        $rootScope.selectedFieldBlockYear = value.FieldBlockYear;
                    }
                });
            });
    };

    $rootScope.LoadSubBlocks = function () {
        return $http.get("data/SubBlocks.json")
            .then(function (response) {
                $rootScope.SubBlocks = response.data;
            });
    };

    $rootScope.LoadTrialGroups = function () {
        return $http.get("data/TrialGroups.json")
            .then(function (response) {
                $rootScope.TrialGroups = response.data;
            });
    };

    $rootScope.LoadTreatments = function () {
        return $http.get("data/Treatment.json")
            .then(function (response) {
                $rootScope.Treatments = response.data;
            });
    };
}]);

app.controller('mainController', function ($rootScope, $scope, $http) {
    $scope.years = [];
    $scope.blocks = [];
    $scope.subBlocks = [];
    $scope.trialGroups = [];

    $http.get("data/FieldBlocks.json")
        .then(function (response) {
            $rootScope.FieldBlocks = response.data.sort(function(a,b) {return (a.FieldBlockYear < b.FieldBlockYear) ? 1 : ((b.FieldBlockYear < a.FieldBlockYear) ? -1 : 0);} );;

            angular.forEach($rootScope.FieldBlocks, function (value, key) {
                var found = $scope.years.some(function (el) {
                    return el === value.FieldBlockYear;
                });

                if (!found) $scope.years.push(value.FieldBlockYear);
            });

            $scope.years = $scope.years.sort().reverse();
        });

    $scope.yearChange = function () {
        $scope.blocks = [];

        angular.forEach($rootScope.FieldBlocks, function (value, key) {
            if ($scope.selectedYear == value.FieldBlockYear) {
                $scope.blocks.push(value);
            }
        });
    };

    $scope.blockChange = function () {
        $scope.subBlocks = [];

        $http.get("data/SubBlocks.json")
            .then(function (response) {
                angular.forEach(response.data, function (value, key) {
                    if ($scope.selectedBlock.FieldBlockID == value.FieldBlockID) {
                        $scope.subBlocks.push(value);
                    }
                });
            });
    };

    $scope.subBlockChange = function () {
        $scope.trialGroups = [];

        $http.get("data/TrialGroups.json")
            .then(function (response) {
                angular.forEach(response.data, function (value, key) {
                    if ($scope.selectedSubBlock.SubBlockID == value.SubBlockID) {
                        $scope.trialGroups.push(value);
                    }
                });
            });
    };

    $scope.search = function () {
        if ($scope.selectedTrialGroup != undefined) {
            window.location.href = "#!/trialGroup/" + $scope.selectedTrialGroup.TrialGroupID;
        }
        else if ($scope.selectedSubBlock != undefined) {
            window.location.href = "#!/subBlock/" + $scope.selectedSubBlock.SubBlockID;
        }
        else if ($scope.selectedBlock != undefined) {
            window.location.href = "#!/block/" + $scope.selectedBlock.FieldBlockID;
        }
        else if ($scope.selectedYear != undefined) {
            window.location.href = "#!/year/" + $scope.selectedYear;
        }
    };

});

app.controller('yearController', function ($scope, $routeParams, $rootScope, $http) {
    var flag = false;
    angular.forEach($rootScope.FieldBlocks, function (value, key) {
        if (value.FieldBlockYear == $routeParams.year) {
            flag = true;
        }
    });
    if (flag == false) {
        window.location.href = "/";
    }

    $rootScope.selectedFieldBlockYear = $routeParams.year;
    $http.get("data/SubBlocks.json")
        .then(function (response) {
            $rootScope.SubBlocks = response.data;

        });
});

app.controller('blockController', function ($scope, $routeParams, $http, $rootScope, $q) {
    var promises = [];


    if ($rootScope.SubBlocks == undefined) {
        $rootScope.LoadSubBlocks();
    }

    if ($rootScope.FieldBlocks == undefined) {
        promises.push($rootScope.LoadFieldBlocks());
    }

    $q.all(promises).then(function () {
        var flag = false;

        angular.forEach($rootScope.FieldBlocks, function (value, key) {
            if (value.FieldBlockID == $routeParams.blockID) {
                flag = true;
            }
        });
        if (flag == false) {
            window.location.href = "/";
        }
        angular.forEach($rootScope.FieldBlocks, function (value, key) {
            if (value.FieldBlockID == $routeParams.blockID) {
                $scope.FieldBlock = value;
            }
        });
        if ($rootScope.selectedFieldBlockYear == undefined) {
            $rootScope.selectedFieldBlockYear = $scope.FieldBlock.FieldBlockYear;
        }
        $rootScope.selectedFieldBlockChar = $scope.FieldBlock.BlockChar;
        $rootScope.selectedFieldBlockID = $scope.FieldBlock.FieldBlockID;
    });
});

app.controller('subBlockController', function ($scope, $rootScope, $routeParams, $http, $q) {
    $scope.TrialGroups = [];

    var promises = [];
    if ($rootScope.SubBlocks == undefined)
        promises.push($rootScope.LoadSubBlocks());

    $http.get("data/TrialGroups.json")
        .then(function (response) {
            $rootScope.TrialGroups = response.data;
            $http.get("data/Treatment.json")
                .then(function (response) {
                    $rootScope.Treatments = response.data;

                    angular.forEach($rootScope.TrialGroups, function (value, key) {
                        if ($routeParams.subBlockID == value.SubBlockID) {
                            $scope.TrialGroups.push(value);
                        }
                    });

                    angular.forEach($scope.TrialGroups, function (value, key) {
                        value.Treatment = [];
                        value.LogChemName = "";
                        value.LogChemDosages = [];
                        angular.forEach($rootScope.Treatments, function (treatmentValue, treatmentKey) {
                            if (value.TrialGroupID == treatmentValue.TrialGroupID) {
                                value.Treatment.push(treatmentValue);
                                if (treatmentValue.DoseLog === true) {
                                    value.LogChemName = treatmentValue.ProductName;
                                    value.LogChemDosages.push(treatmentValue.ProductDose);
                                }
                            }
                            value.LogChemDosages = value.LogChemDosages.sort().reverse();
                        });
                    });
                });
        });
    $q.all(promises).then(function () {
        var flag = false;
        angular.forEach($rootScope.SubBlocks, function (value, key) {
            if (value.SubBlockID == $routeParams.subBlockID) {
                flag = true;
            }
        });
        if (flag == false) {
            window.location.href = "/";
        }

        angular.forEach($rootScope.SubBlocks, function (value, key) {
            if (value.SubBlockID == $routeParams.subBlockID) {
                $scope.SubBlock = value;
            }
        });

        if ($rootScope.selectedFieldBlockChar == undefined)
            $rootScope.GetBlock($scope.SubBlock);

        $rootScope.selectedSubBlockChar = $scope.SubBlock.SubBlockChar;
        $rootScope.selectedSubBlockID = $scope.SubBlock.SubBlockID;
    });
});

app.controller('trialGroupController', function ($scope, $rootScope, $routeParams, $q) {
    var promises = [];
    if ($rootScope.TrialGroups == undefined)
        promises.push($rootScope.LoadTrialGroups());
    if ($rootScope.Treatments == undefined)
        promises.push($rootScope.LoadTreatments());

    $scope.Stages = [];

    $q.all(promises).then(function () {
        var flag = false;

        angular.forEach($rootScope.TrialGroups, function (value, key) {
            if (value.TrialGroupID == $routeParams.trialGroupID) {
                flag = true;
            }
        });
        if (flag == false) {
            window.location.href = "/";
        }

        angular.forEach($rootScope.TrialGroups, function (value, key) {
            value.Treatments = [];
            value.LogChemName = "";
            value.LogChemDosages = [];

            if (value.TrialGroupID == $routeParams.trialGroupID) {
                $scope.TrialGroup = value;

                angular.forEach($rootScope.Treatments, function (treatmentValue, treatmentKey) {
                    if (treatmentValue.TrialGroupID == $scope.TrialGroup.TrialGroupID) {
                        $scope.TrialGroup.Treatments.push(treatmentValue);
                        if (treatmentValue.DoseLog === true) {
                            $scope.TrialGroup.LogChemName = treatmentValue.ProductName;
                            $scope.TrialGroup.LogChemDosages.push(treatmentValue.ProductDose);
                        }
                    }
                    $scope.TrialGroup.LogChemDosages = $scope.TrialGroup.LogChemDosages.sort().reverse();
                });
                if ($rootScope.selectedSubBlockChar == undefined) {
                    $rootScope.GetSubBlock($scope.TrialGroup);
                }
            }
        });
        angular.forEach($scope.TrialGroup.Treatments, function (value, key) {

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

        $rootScope.selectedTrialGroupNr = $scope.TrialGroup.TrialGroupNr;
        $rootScope.selectedTrialGroupID = $scope.TrialGroup.TrialGroupID;
    });
});

app.controller('addYearController', function ($scope, $routeParams, $rootScope) {
    if ($rootScope.addFieldBlocks == undefined)
        $rootScope.addFieldBlocks = [];

    $scope.saveYear = function() {
        angular.forEach($rootScope.addFieldBlocks, function (value, key) {
            value.fieldBlockYear = $routeParams.year;
        });
        console.log($rootScope.addFieldBlocks);
    };

    $rootScope.addYear = $routeParams.year;
});

app.controller('addBlockController', function ($scope, $rootScope) {

    if ($rootScope.addSubBlocks == undefined)
        $rootScope.addSubBlocks = [];

    $scope.saveBlock = function() {
        $rootScope.addFieldBlocks.push({ blockChar: $scope.blockChar, blockLength: $scope.length, blockWidth: $scope.width, comment: $scope.comment, subBlocks: $scope.addSubBlocks })
    };

    $scope.createSubBlock = function() {
        $rootScope.addSubBlock = {subBlockLength: 123, subBlockWidth: 321};
        window.location.href = "#!/addSubBlock/";
    }
});

app.controller('addSubBlockController', function ($scope, $rootScope) {

    if ($rootScope.addTrialGroups == undefined)
        $rootScope.addTrialGroups = [];

    $scope.saveSubBlock = function() {
        $rootScope.addSubBlock = {subBlockChar: $scope.subBlockChar, subBlockLength: $scope.addSubBlock.subBlockLength, subBlockWidth: $scope.addSubBlock.subBlockWidth, comment: $scope.comment, trialGroups: $scope.addTrialGroups }
        $rootScope.addSubBlocks.push($rootScope.addSubBlock);
    };
});

app.controller('addTrialGroupController', function ($scope, $rootScope) {

});