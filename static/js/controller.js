var appControllers = angular.module('appControllers',[]);

appControllers.controller('aboutMeController', function($scope,$http,$stateParams,$state){
    $http.get("static/json/records.json")
    .then(function (response) {
        $scope.myWelcome = response.data.basics;
    });
      $scope.emailadd = localStorage.getItem('email');
      $scope.username =JSON.parse(localStorage.getItem('userdata'))[0].firstname;
      $scope.aboutyou =JSON.parse(localStorage.getItem('userdata'))[0].aboutyou;
   });

appControllers.controller('loginController',function($scope,$http,$stateParams,$state){

  $scope.loginfn=function(){
      $http({
        // url:"http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com/api/login",
       // Content-Type:"application/json",
        data:{'email':$scope.email,'password':$scope.password},
        method: "POST",
        url: "api/login"
      }).then(function(response){
         console.log(response);
       localStorage.setItem('email',$scope.email)
       localStorage.setItem('userdata',JSON.stringify(response.data))
         $('error').text('');
        console.log(response);
         var urlredirect = 'aboutme';
            $state.go(urlredirect);
           //$location.path("/aboutme")
      },function(response){
        alert('Invalid user name or password');
          $('error').text('Invalid email or password')
      })
  }
});

appControllers.controller('signupController',function($scope,$http,$stateParams,$state){

  $scope.signup=function () {
        $http({
             data: {
              "firstname":$scope.firstname,
              "lastname":$scope.lastname,
              "email":$scope.email,
              "password":$scope.password,
              "aboutyou":$scope.aboutyou
             },
//           url: "http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com/api/signup",
             url: "api/signup",
               method: "POST",
        })
        .then(function(response) {
                // success
                localStorage.setItem('email',$scope.email);
      // localStorage.setItem('userdata',JSON.stringify(response.data));
                var urlredirect = 'home';
            $state.go(urlredirect);
        },
        function(response) { // optional
                // failed
                alert("signup failed " + response.status + " statusText = " + response.statusText + " data = " + response.data );
        });
    };
});

appControllers.controller('resumeController',function($scope,$http,$stateParams){
    $http.get("static/json/records.json")
    .then(function (response) {
        $scope.Exp = response.data.Experience;
        $scope.education = response.data.education;
        $scope.project1 = response.data.Project1;
        $scope.project2 = response.data.Project2;
        $scope.project3 = response.data.Project3;
    });
});

appControllers.controller('contactController',function($scope,$http,$stateParams){
      $scope.contact = 'contacts';
      $scope.user= {};
    $scope.submitclicked=function () {
        var formData = new FormData();
        var file = $('#myFile')[0].files[0];
        formData.append('userfile',file);
        formData.append('emailid', localStorage.getItem('email'));
       $http({
             data: formData,
            // url: "http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com/api/userdata",
            url: "api/userdata",
            tranformRequest: angular.identity,
            tranformResponse: angular.identity,
            headers: {
            'Content-Type':undefined//,
           //'Access-Control-Allow-Origin' : '*',
           },
            method: "POST",
        })
        .then(function(response) {
                // success
                alert("file uploaded" +response.status);
                $scope.user.emailid='';
        },
        function(response) { // optional
                // failed
                 alert("File Upload Failed " + response.status);
        });
       $scope.firstName='',
       $scope.lastName='',
       $scope.email=''
    };

});

appControllers.controller('resourceController',function($scope,$http,$stateParams){
     $scope.resource ='resources'
});


appControllers.controller('retrieveController',function($scope,$http,$stateParams,$state){
      $scope.emailadd = localStorage.getItem('email');
      $scope.username =JSON.parse(localStorage.getItem('userdata'))[0].firstname;
      $scope.lastname =JSON.parse(localStorage.getItem('userdata'))[0].lastname;
      $scope.retrievedata=function(){
         $http({
              url: 'api/userdata',
              params: {'emailid': localStorage.getItem('email')},
              method: 'GET'
         }).then(function(response)
        {
            $scope.retrieved = response.data;
        },
        function (response)
        {
            alert("Failed = " + response.status);
        });
    };
    // $scope.deleteFile=function(key){
    //   $http.get('http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com/api/delete',{params:{"key": key}}).success( function(response) {
    //     alert('File Deleted');
    //     $scope.retrievedata();
    //   });
    // };
    $scope.deleteFile=function(key){
      $http.get('api/delete',{params:{"key": key}}).success( function(response) {
        alert('File Deleted');
        $scope.retrievedata();
      });
    };
     $scope.updateFile=function(key){
         $state.go("update", { id: key });
     }
});

appControllers.controller('updateController',function($scope,$http,$stateParams,$state,$stateParams){
      $scope.email = localStorage.getItem('email');
      $scope.firstname =JSON.parse(localStorage.getItem('userdata'))[0].firstname;
      $scope.lastname =JSON.parse(localStorage.getItem('userdata'))[0].lastname;
      $scope.aboutyou =JSON.parse(localStorage.getItem('userdata'))[0].aboutyou;
      $scope.oldfile =$stateParams.id;
       $scope.deleteFile=function(key){
      // $http.get('http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com/api/delete',{params:{"key": key}}).success( function(response) {
      //   //alert('File Deleted');
      //   //$scope.reterivedata();
      // });

      $http.get('api/delete',{params:{"key": key}}).success( function(response) {
        alert('File Deleted');
        $scope.retrievedata();
      });

    };
      $scope.updatefile=function(){
            var formData = new FormData();
            // for(key in $scope.user){
            //   formData.append(key,$scope.user[key]);
            // };
            formData.append('emailid',$scope.email);
            var file = $('#newfile')[0].files[0];
            formData.append('userfile',file);
           $http({
                 data: formData,
                // url: "http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com/api/userdata",
                url: "api/userdata",
                tranformRequest: angular.identity,
                tranformResponse: angular.identity,
                headers: {
                'Content-Type':undefined//,
               //'Access-Control-Allow-Origin' : '*',
               },
                method: "POST",
            })
            .then(function(response) {
                    // success
                    $scope.deleteFile($scope.oldfile);
                    alert("File Update Successful");
                    $state.go('retrieve');
                   // $scope.user.emailid='';
            },
            function(response) { // optional
                    // failed
                     alert("File Upload Failed " + response.status);
            });
      }
});

appControllers.controller('navlogoutController',function($scope,$http,$stateParams,$state){
          $scope.logoutfn=function(){
        if(localStorage.getItem('email').length>0){
            var urlredirect = 'home';
              $state.go(urlredirect);
              localStorage.setItem('email','');
              localStorage.setItem('userdata','');
        }
    };
});
