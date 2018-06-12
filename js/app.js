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
            templateUrl: 'addTrialGroup2.html',
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
        $http.get("http://localhost:50458/GetTrialGroupSubBlock/" + trialGroup.TrialGroupID)
            .then(function (response) {
                console.log(SubBlock);
                SubBlock = response.data;
                $rootScope.selectedSubBlockChar = SubBlock.SubBlockChar;
                $rootScope.selectedSubBlockID = SubBlock.SubBlockID;
                $rootScope.GetBlock(SubBlock);
            });
    };

    $rootScope.GetBlock = function (subBlock) {
        $http.get("http://localhost:50458/GetSubBlockFieldBlock/" + subBlock.SubBlockID)
            .then(function (response) {
                $rootScope.selectedFieldBlockChar = response.data.BlockChar;
                $rootScope.selectedFieldBlockID = response.data.FieldBlockID;
                $rootScope.selectedFieldBlockYear = response.data.FieldBlockYear;
            });
    };

    $rootScope.LoadFieldBlock = function (fieldblockid) {
        return $http.get("http://localhost:50458/GetFieldBlock/" + fieldblockid)
            .then(function (response) {
                $rootScope.FieldBlock = response.data;
            });
    };

    $rootScope.LoadSubBlocks = function (fieldblockid) {
        return $http.get("http://localhost:50458/GetSubBlocks/" + fieldblockid)
            .then(function (response) {
                $rootScope.SubBlocks = response.data;
            });
    };

    $rootScope.LoadSubBlock = function (subblockid) {
        return $http.get("http://localhost:50458/GetSubBlock/" + subblockid)
            .then(function (response) {
                $rootScope.SubBlock = response.data;
            });
    };

    $rootScope.LoadTrialGroupsAndTreatments = function (subblockid) {
        return $http.get("http://localhost:50458/GetTrialGroups/" + subblockid)
            .then(function (response) {
                $rootScope.TrialGroups = response.data;
                angular.forEach($rootScope.TrialGroups, function (value, key) {
                    value.Treatment = [];
                    value.LogChemName = "";
                    value.LogChemDosages = [];
                    $http.get("http://localhost:50458/GetTrialGroupTreatments/" + value.TrialGroupID)
                        .then(function (response) {
                            var treatments = response.data;
                            angular.forEach(treatments, function (treatmentValue, treatmentKey) {
                                value.Treatment.push(treatmentValue);
                                if (treatmentValue.DoseLog === true) {
                                    value.LogChemName = treatmentValue.ProductName;
                                    value.LogChemDosages.push(treatmentValue.ProductDose);
                                }
                                value.LogChemDosages = value.LogChemDosages.sort().reverse();
                            });
                        });
                });
                console.log($rootScope.TrialGroups);
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
    $scope.years = [];
    $scope.blocks = [];
    $scope.subBlocks = [];
    $scope.trialGroups = [];

    $http.get("http://localhost:50458/GetYears")
        .then(function (response) {
            $scope.years = response.data;

            $scope.years = $scope.years.sort().reverse();
        });

    $scope.yearChange = function () {
        $scope.blocks = [];

        $http.get("http://localhost:50458/GetFieldBlocks/" + $scope.selectedYear)
            .then(function (response) {
                $scope.blocks = response.data;
            });
    };

    $scope.blockChange = function () {
        $scope.subBlocks = [];

        $http.get("http://localhost:50458/GetSubBlocks/" + $scope.selectedBlock.FieldBlockID)
            .then(function (response) {
                $scope.subBlocks = response.data;
            });
    };

    $scope.subBlockChange = function () {
        $scope.trialGroups = [];

        $http.get("http://localhost:50458/GetTrialGroups/" + $scope.selectedSubBlock.SubBlockID)
            .then(function (response) {
                $scope.trialGroups = response.data;
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
    $http.get("http://localhost:50458/GetFieldBlocks/" + $routeParams.year)
        .then(function (response) {
            $scope.FieldBlocks = response.data;
            if ($scope.FieldBlocks.length <= 0)
                window.location.href = "/";
            $scope.SubBlocks = [];

            angular.forEach($scope.FieldBlocks, function (value, key) {
                console.log("http://localhost:50458/GetSubBlocks/" + value.FieldBlockID);
                $http.get("http://localhost:50458/GetSubBlocks/" + value.FieldBlockID)
                    .then(function (response) {
                        value.SubBlocks = response.data;
                    });
            });
        });

    $rootScope.selectedFieldBlockYear = $routeParams.year;

    $scope.addBlock = function () {
        $rootScope.addBlock = undefined;
        $rootScope.addSubBlock = undefined;
        $rootScope.addSubBlocks = undefined;
        $rootScope.addYear = $routeParams.year;
        window.location.href = "#!/addBlock";
    }
});

app.controller('blockController', function ($scope, $routeParams, $http, $rootScope, $q) {
    var promises = [];

    promises.push($rootScope.LoadFieldBlock($routeParams.blockID));
    promises.push($rootScope.LoadSubBlocks($routeParams.blockID));

    $q.all(promises).then(function () {
        if ($rootScope.FieldBlock == undefined) {
            window.location.href = "/";
        }
        $scope.FieldBlock = $rootScope.FieldBlock;

        if ($rootScope.selectedFieldBlockYear == undefined) {
            $rootScope.selectedFieldBlockYear = $scope.FieldBlock.FieldBlockYear;
        }
        $rootScope.selectedFieldBlockChar = $scope.FieldBlock.BlockChar;
        $rootScope.selectedFieldBlockID = $scope.FieldBlock.FieldBlockID;

        $scope.editBlockInfo = function () {
            $rootScope.addSubBlock = undefined;
            $rootScope.addSubBlocks = undefined;
            $rootScope.addYear = $scope.FieldBlock.FieldBlockYear;
            $rootScope.addBlock = { blockChar: $scope.FieldBlock.BlockChar, blockLength: $scope.FieldBlock.FieldBlockLength, blockwidth: $scope.FieldBlock.FieldBlockWidth, blockComment: $scope.FieldBlock.FieldBlockComment };
            angular.forEach($rootScope.SubBlocks, function (subBlock, key) {
                if (subBlock.FieldBlockID == $scope.FieldBlock.FieldBlockID) {
                    if ($rootScope.addSubBlocks == undefined) {
                        $rootScope.addSubBlocks = [];
                    }

                    $rootScope.addSubBlocks.push({ subBlockChar: subBlock.SubBlockChar, subBlockLength: subBlock.SubBlockLength, subBlockWidth: subBlock.SubBlockWidth, comment: subBlock.Comment, trialGroups: undefined, PosL: subBlock.PosL, PosW: subBlock.PosW });
                }
            });
            window.location.href = "#!/addBlock";
        };
    });
});

app.controller('subBlockController', function ($scope, $rootScope, $routeParams, $http, $q) {
    var promises = [];
    promises.push($rootScope.LoadSubBlock($routeParams.subBlockID));
    promises.push($rootScope.LoadTrialGroupsAndTreatments($routeParams.subBlockID));

    $q.all(promises).then(function () {
        if ($rootScope.SubBlock == undefined) {
            window.location.href = "/";
        }

        if ($rootScope.selectedFieldBlockChar == undefined)
            $rootScope.GetBlock($rootScope.SubBlock);

        $rootScope.selectedSubBlockChar = $rootScope.SubBlock.SubBlockChar;
        $rootScope.selectedSubBlockID = $rootScope.SubBlock.SubBlockID;

        $scope.editSubBlockInfo = function () {
            $rootScope.addSubBlocks = undefined;
            $rootScope.addYear = $rootScope.selectedFieldBlockYear;
            angular.forEach($scope.TrialGroups, function (value, key) {
                if ($rootScope.addTrialGroups == undefined)
                    $rootScope.addTrialGroups = [];
                $rootScope.addTrialGroups.push({ TrialGroupNr: value.TrialGroupNr, Crop: value.CropName, LogChemName: value.LogChemName, LogChemDosages: value.LogChemDosages, TrialComment: value.Comment, Treatments: value.Treatment })
            });
            $rootScope.addSubBlock = { subBlockChar: $scope.SubBlock.SubBlockChar, subBlockLength: $scope.SubBlock.SubBlockLength, subBlockWidth: $scope.SubBlock.SubBlockWidth, comment: $scope.SubBlock.Comment, trialGroups: $rootScope.addTrialGroups, PosL: $scope.SubBlock.PosL, PosW: $scope.SubBlock.PosW };

            window.location.href = "#!/addSubBlock";
        };
    });
});

app.controller('trialGroupController', function ($scope, $rootScope, $routeParams, $q) {
    var promises = [];
    promises.push($rootScope.LoadTrialGroup($routeParams.trialGroupID));
    promises.push($rootScope.LoadTrialGroupTreatments($routeParams.trialGroupID));


    $scope.Stages = [];

    $q.all(promises).then(function () {
        if ($rootScope.TrialGroup == undefined) {
            window.location.href = "/";
        }

        if ($rootScope.selectedSubBlockChar == undefined) {
            $rootScope.GetSubBlock($scope.TrialGroup);
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

        $rootScope.selectedTrialGroupNr = $scope.TrialGroup.TrialGroupNr;
        $rootScope.selectedTrialGroupID = $scope.TrialGroup.TrialGroupID;

        $scope.editTrialGroupInfo = function () {
            $rootScope.addSubBlocks = undefined;
            $rootScope.addYear = $rootScope.selectedFieldBlockYear;
            angular.forEach($scope.TrialGroups, function (value, key) {
                if ($rootScope.addTrialGroups == undefined)
                    $rootScope.addTrialGroups = [];
                $rootScope.addTrialGroups.push({ TrialGroupNr: value.TrialGroupNr, Crop: value.CropName, LogChemName: value.LogChemName, LogChemDosages: value.LogChemDosages, TrialComment: value.Comment, Treatments: value.Treatment })
            });
            $rootScope.addSubBlock = { subBlockChar: $scope.SubBlock.SubBlockChar, subBlockLength: $scope.SubBlock.SubBlockLength, subBlockWidth: $scope.SubBlock.SubBlockWidth, comment: $scope.SubBlock.Comment, trialGroups: $rootScope.addTrialGroups, PosL: $scope.SubBlock.PosL, PosW: $scope.SubBlock.PosW };

            window.location.href = "#!/addSubBlock";
        };
    });
});

app.controller('addYearController', function ($scope, $routeParams, $rootScope,$http) {
    if ($rootScope.addFieldBlocks == undefined)
        $rootScope.addFieldBlocks = [];

    $scope.saveYear = function () {
        angular.forEach($rootScope.addFieldBlocks, function (value, key) {
            value.fieldBlockYear = $routeParams.year;
            var newBlock = {FieldBlockID: 0, BlockChar:value.blockChar, FieldBlockYear:value.fieldBlockYear, FieldBlockLength:value.blockLength, FieldBlockWidth:value.blockWidth, Comment:value.comment, SubBlocks:[]};
            angular.forEach(value.subBlocks, function (subblock, keys) {
                var newSubBlock = {SubBlockID:0, SubBlockChar:subblock.subBlockChar, AmountOfTrialGroups:16, LastNrOfTrialGroup:16, SubBlockLength:subblock.subBlockLength, SubBlockWidth:subblock.subBlockWidth, PosL:subblock.PosL, PosW:subblock.PosW,Comment:subblock.comment,SubBlockTrialType:{Name:"Weed"},TrialGroups:[]};
                angular.forEach(subblock.trialGroups, function (trialgroup, keyt) {
                    var newTrialGroup = {TrialGroupID:0, TrialGroupCrop:{name:trialgroup.Crop}, TrialGroupNr:trialgroup.TrialGroupNr, Comment:trialgroup.TrialComment, Treatments:[]};
                    angular.forEach(trialgroup.Treatments, function (treatment, keytr) {
                        var newTreatment = {TreatmentID:0, TreatmentTreatmentType:{Name:"Fertilizing"}, TreatmentDate:treatment.Date, TreatmentStage:treatment.Stage, Comment:treatment.Comment, Products:[]};
                        angular.forEach(treatment.Products, function (product, keyp) {
                            var newProduct = {TrtProduct:{Name:product.productName, Owner:"", Category:{Name:""}}, ProductDose:product.productDose, ProductUnit:{Name:product.productUnit}, DoseLog:product.doseLog, Results:null};
                            newTreatment.Products.push(newProduct);
                        });
                        newTrialGroup.Treatments.push(newTreatment);
                    });
                    newSubBlock.TrialGroups.push(newTrialGroup);
                });
                newBlock.SubBlocks.push(newSubBlock);
            });
            console.log("NEWBLOCK");
            console.log(newBlock);
            console.log("ENDNEWBLOCK");
            var res = $http.post('http://localhost:50458/AddFieldBlock/', newBlock);
		res.success(function(data, status, headers, config) {
			$scope.message = data;
		});
		res.error(function(data, status, headers, config) {
			alert( "failure message: " + JSON.stringify({data: data}));
		});
        });
    };

    $scope.addBlockButton = function () {
        $rootScope.addBlock = undefined;
        $rootScope.addSubBlock = undefined;
        $rootScope.addSubBlocks = undefined;
        window.location.href = "#!/addBlock/";
    };

    $rootScope.addYear = $routeParams.year;
});

app.controller('addBlockController', function ($scope, $rootScope) {
    console.log($rootScope.addYear);
    if ($rootScope.addSubBlocks == undefined)
        $rootScope.addSubBlocks = [];
    if ($rootScope.addBlock != undefined) {
        $scope.blockChar = $rootScope.addBlock.blockChar;
        $scope.length = $rootScope.addBlock.blockLength;
        $scope.width = $rootScope.addBlock.blockwidth;
        $scope.comment = $rootScope.addBlock.blockComment;
    }


    $scope.saveBlock = function () {
        $rootScope.addFieldBlocks.push({ blockChar: $scope.blockChar, blockLength: $scope.length, blockWidth: $scope.width, comment: $scope.comment, subBlocks: $scope.addSubBlocks })
        window.location.href = "#!/addYear/" + $rootScope.addYear;
    };

    $scope.createSubBlock = function (element) {

        if ($scope.length != undefined && $scope.width != undefined) {
            $rootScope.addBlock = { blockChar: $scope.blockChar, blockLength: $scope.length, blockwidth: $scope.width, blockComment: $scope.comment };
            var subBlockElm = $(angular.element(element.target)).closest('.subBlockBlock');
            var blockContainer = $('#addSubBlockArea');

            var blHeight = blockContainer.height();
            var blWidth = blockContainer.width();
            var subBlHeight = Math.floor(subBlockElm.height());
            var subBlWidth = Math.floor(subBlockElm.width());
            var subBlPercHeight = subBlHeight * 100 / blHeight;
            var subBlPercWidth = subBlWidth * 100 / blWidth;
            var leftPos = subBlockElm.position().left * $scope.width / blWidth;
            var topPos = subBlockElm.position().top * $scope.length / blHeight;
            $rootScope.addSubBlock = { subBlockLength: Math.floor($scope.length * subBlPercHeight / 100), subBlockWidth: Math.floor($scope.width * subBlPercWidth / 100), PosL: topPos, PosW: leftPos };
            window.location.href = "#!/addSubBlock/";
        }
    }

    $('.subBlockBlock').resizable({
        containment: '#addSubBlockArea'
    });
    $('.subBlockBlock').draggable({
        containment: '#addSubBlockArea',
        start: function (event, ui) {
            isDraggingMedia = true;
        },
        stop: function (event, ui) {
            isDraggingMedia = false;
            // blah
        }
    });
});

app.controller('addSubBlockController', function ($scope, $rootScope) {

    if ($rootScope.addTrialGroups == undefined)
        $rootScope.addTrialGroups = [];

    if ($rootScope.addSubBlock != undefined) {
        $scope.subBlockChar = $rootScope.addSubBlock.subBlockChar;
        $scope.comment = $rootScope.addSubBlock.comment;
        console.log($rootScope.addTrialGroups);
    }

    $scope.saveSubBlock = function () {
        $rootScope.addSubBlock = { subBlockChar: $scope.subBlockChar, subBlockLength: $scope.addSubBlock.subBlockLength, subBlockWidth: $scope.addSubBlock.subBlockWidth, comment: $scope.comment, trialGroups: $scope.addTrialGroups, PosL: $scope.addSubBlock.PosL, PosW: $scope.addSubBlock.PosW }
        $rootScope.addSubBlocks.push($rootScope.addSubBlock);
        window.location.href = "#!/addBlock/";
    };

    $scope.addTrialGrButton = function () {
        $rootScope.addSubBlock.subBlockChar = $scope.subBlockChar;
        $rootScope.addSubBlock.comment = $scope.comment;
        window.location.href = "#!/addTrialGroup/";
    }
});

app.controller('addTrialGroupController', function ($scope, $rootScope, $http) {
    $scope.Weeds = [];
    $scope.Treatments = [];
    $scope.Products = [];

    $http.get("http://localhost:50458/GetAllWeeds")
        .then(function (response) {
            $scope.Weeds = response.data;
        });

    $scope.addTreatment = function () {


        $scope.DisplayProducts = JSON.parse(JSON.stringify($scope.Products));
        $scope.DisplayProducts.push({ productName: $scope.logChemName, productDose: 'LOG', productUnit: 0, doseLog: true });
        $scope.Products.push({ productName: $scope.logChemName, productDose: $scope.logDose1, productUnit: $scope.logDoseUnit, doseLog: true });
        $scope.Products.push({ productName: $scope.logChemName, productDose: $scope.logDose2, productUnit: $scope.logDoseUnit, doseLog: true });
        $scope.Products.push({ productName: $scope.logChemName, productDose: $scope.logDose3, productUnit: $scope.logDoseUnit, doseLog: true });
        $scope.Products.push({ productName: $scope.logChemName, productDose: $scope.logDose4, productUnit: $scope.logDoseUnit, doseLog: true });
        $scope.Products.push({ productName: $scope.logChemName, productDose: $scope.logDose5, productUnit: $scope.logDoseUnit, doseLog: true });


        $scope.Treatments.push({ Stage: $scope.stage, Date: $scope.date, Products: $scope.Products, DisplayProducts: $scope.DisplayProducts, Comment: $scope.treatmentComment });
        $scope.Products = [];
        $scope.chemName = '';
        $scope.chemDose = '';
        $scope.chemUnit = '';
        $scope.stage = '';
        $scope.date = '';
        $scope.logChemName = '';
        $scope.logDose1 = '';
        $scope.logDose2 = '';
        $scope.logDose3 = '';
        $scope.logDose4 = '';
        $scope.logDose5 = '';
        $scope.logDoseUnit = '';
        $scope.treatmentComment = '';
    };

    $scope.addChem = function () {
        $scope.Products.push({ productName: $scope.chemName, productDose: $scope.chemDose, productUnit: $scope.chemUnit, doseLog: false });
        $scope.chemName = '';
        $scope.chemDose = '';
        $scope.chemUnit = '';
    };

    $scope.saveTrialGroup = function () {
        $scope.LogChemName = "";
        $scope.LogChemDosages = [];

        angular.forEach($scope.Treatments, function (treatmentValue, treatmentKey) {
            angular.forEach(treatmentValue.Products, function (value, key) {
                if (value.doseLog === true) {
                    $scope.LogChemName = value.productName;
                    $scope.LogChemDosages.push(value.productDose);
                }
            });
        });
        $scope.LogChemDosages = $scope.LogChemDosages.sort().reverse();

        $rootScope.addTrialGroups.push({ TrialGroupNr: $scope.trialGroupNr, Crop: $scope.selectedWeed.Name, LogChemName: $scope.LogChemName, LogChemDosages: $scope.LogChemDosages, TrialComment: $scope.comment, Treatments: $scope.Treatments });

        window.location.href = "#!/addSubBlock/";
    }
});

function editToggle() {
    $('.addBtn').toggle();
}