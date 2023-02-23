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
function isSignedIn(){
    var signedIn = localStorage.getItem("IsSignedIn");
    if(signedIn == "true"){
        document.getElementById("PrefferedName").innerHTML = localStorage.getItem("PrefName");
        document.getElementById("FirstName").innerHTML = localStorage.getItem("FirstName");
    }
    else{
        alert("Sorry you need to be signed in to view this page.");
        window.location.href="/index.html";
    }
}
function logout(){
    localStorage.setItem("IsSignedIn", false);
}

