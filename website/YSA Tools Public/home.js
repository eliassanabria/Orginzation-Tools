function updateStatus(){
    var selectedStatus = document.getElementById("status-dropdown").value;
    document.getElementById("status-dropdown-mobile").value = selectedStatus;
    updateStatusIcons();
}
function updateStatusMobile(){
    var selectedStatus = document.getElementById("status-dropdown-mobile").value;
    document.getElementById("status-dropdown").value = selectedStatus;
    updateStatusIcons();
}
function updateStatusIcons(){
    var selectedStatus = document.getElementById("status-dropdown-mobile").value;
    if(selectedStatus =="Appear Offline"){
        document.getElementById("CurrentUserLoggedIn").className = "overlayUserStatusOffline";
    }
    if(selectedStatus =="Online"){
        document.getElementById("CurrentUserLoggedIn").className = "overlayUserStatusOnline";
    }
    if(selectedStatus =="Away"){
        document.getElementById("CurrentUserLoggedIn").className = "overlayUserStatusAway";
    }
    if(selectedStatus =="Do Not Disturb"){
        document.getElementById("CurrentUserLoggedIn").className = "overlayUserStatusDND";
    }
}
function isSignedInDir(){
    var signedIn = localStorage.getItem("IsSignedIn");
    if(signedIn == "true"){
        document.getElementById("PrefferedName").innerHTML = localStorage.getItem("PrefName");
        document.getElementById("FirstName").innerHTML = localStorage.getItem("FirstName");
        document.getElementById("FirstNameDesktop").innerHTML = localStorage.getItem("FirstName");
        getDirectory();
    }
    else{
        alert("Sorry you need to be signed in to view this page.");
        window.location.href="/index.html";
    }
}
function isSignedInSett(){
    var signedIn = localStorage.getItem("IsSignedIn");
    if(signedIn == "true"){
        document.getElementById("PrefferedNameSetting").innerHTML = localStorage.getItem("PrefName");
        document.getElementById("FirstName").innerHTML = localStorage.getItem("FirstName");
        document.getElementById("FirstNameDesktop").innerHTML = localStorage.getItem("FirstName");
        document.getElementById("FirstNameSetting").innerHTML = localStorage.getItem("FirstName");
        document.getElementById("LastNameSetting").innerHTML = localStorage.getItem("LastName");
        document.getElementById("userEmailSetting").value = localStorage.getItem("EmailAddress");
        document.getElementById("userPhoneSetting").value = localStorage.getItem("PhoneNumber");
        document.getElementById("UserDOBSetting").value = localStorage.getItem("DOB");
        document.getElementById("userPassSetting").value = localStorage.getItem("Password");
    }
    else{
        alert("Sorry you need to be signed in to view this page.");
        window.location.href="/index.html";
    }
}
function logout(){
    localStorage.setItem("IsSignedIn", false);
}

function getDirectory(){
    const prefNameAPICall = 'name';

    const gridContainer = document.getElementById("directory-grid");
    const users = [];
    const apiUrl = "https://jsonplaceholder.typicode.com/users";

    // Call the API and get the response
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        const users = Array.from(data); // Create an array from the JSON data
        console.log(users); // This will log an array of user objects to the console
        // Do something with the user data here, such as displaying it in the UI

        console.log("There are " + users.length + " from api call");

        for (let i = 0; i < users.length; i++) {
            const item = users[i];
          
            // Create a grid item element
            const gridItem = document.createElement("div");
            gridItem.className = "directory-item";
          
            // Create the inner structure of the grid item
            const userObjectBoarder = document.createElement("div");
            userObjectBoarder.className = "Directory_User_Object_Boarder";
          
            const userSmallProfileIconBoarder = document.createElement("div");
            userSmallProfileIconBoarder.className = "directory_user_small_profile_icon_boarder";
          
            const userSmallProfileIcon = document.createElement("img");
            userSmallProfileIcon.className = "directory_user_small_profile_icon";
            //userSmallProfileIcon.src = item.image;
            userSmallProfileIcon.src = 'https://cdn-icons-png.flaticon.com/512/456/456212.png';
            userSmallProfileIcon.alt = "UserImageProfileSmall";
          
            const userStatusOnline = document.createElement("div");
            userStatusOnline.id = "CurrentUserLoggedIn";
            //Uncomment code below once service is available.
            //userStatusOnline.className = `overlayUserStatus${item.status}`;
            userStatusOnline.className = `overlayUserStatusOffline`;
          
            const userPreferredName = document.createElement("div");
            userPreferredName.className = "UserPreferredName";
            userPreferredName.textContent = item.name;
          
            const userApartmentLabel = document.createElement("div");
            userApartmentLabel.className = "UserApartmentLable";
            //Change this to address once service is written
            userApartmentLabel.textContent = item.address.street + ' ' + item.address.suite;
          
            const userCallingsLabel = document.createElement("div");
            userCallingsLabel.className = "UserCallingsLable";
            //Change this to callings when service is available.
            userCallingsLabel.textContent = item.company.name;
          
            // Append the elements to the grid item
            userSmallProfileIconBoarder.appendChild(userSmallProfileIcon);
            userSmallProfileIconBoarder.appendChild(userStatusOnline);
            userObjectBoarder.appendChild(userSmallProfileIconBoarder);
            userObjectBoarder.appendChild(userPreferredName);
            userObjectBoarder.appendChild(userApartmentLabel);
            userObjectBoarder.appendChild(userCallingsLabel);
            gridItem.appendChild(userObjectBoarder);
          
            // Append the grid item to the grid container
            gridContainer.appendChild(gridItem);
        }
    

      })
      .catch(error => {
        console.error("There was a problem fetching the user data:", error);
      });
    }

