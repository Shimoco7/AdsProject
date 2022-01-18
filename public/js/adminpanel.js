var arr = ["Ads", "ActiveUsers", "InActiveUsers"];
for (var i = 0; i < arr.length; i++) {
    $.ajax({
        url: '/AdminPanel',
        type: 'GET',
        data: { 'name': arr[i] },
        success: function (res) {
            var json = JSON.parse(res);
            var table = document.getElementById(json[0]);
            var firstRow = table.rows[0];
            var colsLen = table.rows[0].cells.length;
            var rowsLen = json[1].length;
            for (var k = 0; k < rowsLen; k++) {
                const element = json[1][k];
                var row = table.insertRow(-1);
                row.setAttribute(json[0], element[Object.keys(element)[1]], 0);
                for (var j = 0; j < colsLen; j++) {
                    var firstRowKey = firstRow.cells[j].innerHTML;
                    var cell = row.insertCell(j);
                    if (json[0] === "Ads") {
                        var element1 = document.createElement('textarea');
                        element1.rows = 6;
                        element1.cols = 30;
                    }
                    else {
                        var element1 = document.createElement('input');
                        element1.type = "text";
                        //element1.size = "70";
                        //element1.height = "70px";
                    }
                    element1.value = element[firstRowKey];
                    element1.disabled = true;
                    cell.appendChild(element1);
                }
            }
        }
    });
}


$.ajax({
    url: '/AdminDetails',
    type: 'GET',
    success: function (res) {
        var json = JSON.parse(res);
        $('#username').val(json.username);
        $('#password').val(json.password);
        $('#confirm_password').val(json.password);
    }
});

function showPassFunc() {
    if (document.getElementById('showPassword').innerHTML === "Show Password") {
        document.getElementById('password').type = "text";
        document.getElementById('confirm_password').type = "text";
        document.getElementById('showPassword').innerHTML = "Hide Password";
    }
    else {
        document.getElementById('password').type = "password";
        document.getElementById('confirm_password').type = "password";
        document.getElementById('showPassword').innerHTML = "Show Password";
    }
}

$('#updateAdminForm').submit(function (event) {
    event.preventDefault();
    var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,15}$/;
    var minNumberofChars = 5;
    var maxNumberofChars = 15;
    var newPassword = $('#password').val();
    var passwordConfirmation = $('#confirm_password').val();
    var newUsername = $('#username').val();
    if (newPassword !== passwordConfirmation) {
        alert("Error; Password and Confirmation inputs are not equal");
        return false;
    }
    if (newPassword.length < minNumberofChars ||
        newPassword.length > maxNumberofChars ||
        newUsername.length < minNumberofChars ||
        newUsername.length > maxNumberofChars ||
        !regularExpression.test(newPassword)) {
        alert("Error; Username must be between 5-15 characters\nPassword must be between 5-15 characters\nPassword must contain at least one number\nPassword must contain at least one special character[!@#$%^&*]");
        return false;
    }

    $.ajax({
        url: '/AdminDetails',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username: newUsername, password: newPassword }),
        dataType: 'JSON',
        success: function (res) {
            if (res === "Password Updated Successfully") {
                $('#formTitle').css({
                    "color":"green",
                    "text-align":"center"
                })
                $('#formTitle').text("Username and/or Password have been changed successfully");
                setTimeout(() => {
                    $('#formTitle').css({
                        "color":"black",
                        "text-align":"center"
                    })
                    $('#formTitle').text("Change Username and Password");
                }, 5 * 1000);
            }
            else if (res === "No Data Changed") {
                alert("This username and password are already updated");
            }
        },
        error: function (error) {
            console.log(error);
        }
    });

});

function updateAdminPanelActive(data) {
    $.ajax({
        url: '/getActiveUsers',
        type: 'GET',
        success: function (res) {
            console.log(res);
            var json = JSON.parse(res);
            fillUsersCells(json, "ActiveUsers");
            deleteUserFromTable(data, "InActiveUsers");
        }
    });
}

function updateAdminPanelInActive(data) {
    $.ajax({
        url: '/getInActiveUsers',
        type: 'GET',
        success: function (res) {
            var json = JSON.parse(res);
            fillUsersCells(json, "InActiveUsers");
            deleteUserFromTable(data, "ActiveUsers");
        }
    });
}


function deleteUserFromTable(clientId, collection) {
    var table = document.getElementById(collection);
    var rowCount = table.rows.length;
    for (var i = 1; i < rowCount; i++) {
        var client = table.rows[i].cells[0].children[0];
        client.disabled = false;
        if (client.value == clientId) {
            table.deleteRow(i);
        }
        else {
            client.disabled = true;
        }
    }
}

function fillUsersCells(json, collection) {
    var table = document.getElementById(collection);
    var firstRow = table.rows[0];
    var colsLen = table.rows[0].cells.length;
    const element = json[0];
    var row = table.insertRow(-1);
    for (var j = 0; j < colsLen; j++) {
        var firstRowKey = firstRow.cells[j].innerHTML;
        var cell = row.insertCell(j);
        var element1 = document.createElement('input');
        element1.type = "text";
        element1.size = "70";
        element1.height = "70px";
        element1.value = element[firstRowKey];
        element1.disabled = true;
        cell.appendChild(element1);
    }
}


function deleteAd() {
    var table = document.getElementById("Ads");
    if (table.tBodies[0].rows.length < 2) {
        return;
    }

    while (!validateEditAndDelete(adName)) {
        var adName = prompt("Please enter the advertisement name you want to delete");
        if (adName == null) {
            return;
        }
    }


    $.ajax({
        url: '/DeleteAd',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ 'name': adName }),
        success: function (res) {
            console.log(res);
            if (res === "Not Connected") {
                location.reload();
                return;
            }
            if (res === "No advertisement has been deleted")
                alert(res);
            else {
                findByAttributeValue("Ads", adName, "tr").remove();
            }
        },
        error: function (error) {
        }
    });
}


function addAd() {

    while (!validateName(name)) {
        var name = prompt("Please enter the advertisement name:");
        if (name == null) {
            return;
        }
    }

    while (!validateText(text)) {
        var text = prompt("Please enter the advertisement text(sentences separated by a comma(,) , Exactly 2):");
        if (text == null) {
            return;
        }
    }


    while (!validateImages(images)) {
        var images = prompt("Please enter the advertisement images as a valid URL (separated by a comma(,) , Exactly 6):");
        if (images == null) {
            return;
        }
    }


    while (!validateDate(fromDate)) {
        var fromDate = prompt("Please enter the advertisement start date ( For Example: M/DD/YYYY):");
        if (fromDate == null) {
            return;
        }
    }


    while (!validateDate(toDate)) {
        var toDate = prompt("Please enter the advertisement end date ( For Example: M/DD/YYYY):");
        if (toDate == null) {
            return;
        }
    }


    while (!validateDays(days)) {
        var days = prompt("Please enter the advertisement days you want to display (0-6 for each day ,separated by a comma(,)):");
        if (days == null) {
            return;
        }
    }


    while (!validateHours(hours)) {
        var hours = prompt("Please enter the advertisement hours you want to display (0-23 for each hour ,separated by a comma(,)):");
        if (hours == null) {
            return;
        }
    }


    while (!validateSeconds(secondsOfAd)) {
        var secondsOfAd = prompt("Please enter the advertisement seconds you want to display (0-9 for each second ,separated by a comma(,)):");
        if (secondsOfAd == null) {
            return;
        }
    }



    while (!validateType(type)) {
        var type = prompt("Please enter the advertisement type:");
        if (type == null) {
            return;
        }
    }

    newAd = {
        'name': name, 'text': formatToList(text), 'images': formatToList(images),
        'FromDate': fromDate, 'ToDate': toDate, 'Days': sortAndUnique(days), 'Hours': sortAndUnique(hours),
        'secondsOfAd': sortAndUnique(secondsOfAd), 'type': type
    }

    $.ajax({
        url: '/AddAd',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(newAd),
        success: function (res) {
            if (res === "Not Connected") {
                location.reload();
                return;
            }
            var counter = 0;
            var table = document.getElementById("Ads");
            var row = table.insertRow(-1);
            row.setAttribute("Ads", name, 0);
            for (const [key, value] of Object.entries(newAd)) {
                var cell = row.insertCell(counter);
                counter++;
                var element1 = document.createElement('textarea');
                element1.rows = 6;
                element1.cols = 30;
                element1.type = "text";
                element1.size = "70";
                element1.height = "70px";
                element1.value = value;
                element1.disabled = true;

                cell.appendChild(element1);
            }

        },
        error: function (error) {
            console.log(error);
        }
    });
}


var oldAd;
function editAd() {
    var table = document.getElementById("Ads");
    if (table.tBodies[0].rows.length < 2) {
        return;
    }
    var editedRow = getEditedRow();
    if (editedRow != null) {
        alert("Error; There is already an advertisement during editing process");
        return
    }

    while (!validateEditAndDelete(adName)) {
        var adName = prompt("Please enter the advertisement name you want to edit");
        if (adName == null) {
            return;
        }
    }
    var ad = findByAttributeValue("Ads", adName, "tr");
    oldAd = getAdFields(ad);
    unDisableRow(ad);
}

function saveChanges() {
    var table = document.getElementById("Ads");
    if (table.tBodies[0].rows.length < 2) {
        return;
    }
    var editedRow = getEditedRow();
    if (editedRow == null) {
        alert("Error; Please choose an advertisement you want to edit");
        return;
    }

    var editedAd = getAdFields(editedRow);
    if (!isAdChanged(oldAd, editedAd)) {
        alert("No changes has been made");
        return;
    }

    if (!validateText(editedAd['text'])) {
        return;
    }

    if (!validateImages(editedAd['images'])) {
        return;
    }

    if (!validateDate(editedAd['FromDate'])) {
        return;
    }
    if (!validateDate(editedAd['ToDate'])) {
        return;
    }

    if (!validateDays(editedAd['Days'])) {
        return;
    }

    if (!validateHours(editedAd['Hours'])) {
        return;
    }

    if (!validateSeconds(editedAd["secondsOfAd"])) {
        return;
    }


    if (!validateType(editedAd["type"])) {
        return;
    }


    disableRow(editedRow);
    editedAdForDB = getAdFieldsForDB(editedRow);
    saveChangesToDB(editedAdForDB);
}

function saveChangesToDB(editedAdForDB) {

    $.ajax({
        url: '/EditAd',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(editedAdForDB),
        success: function (res) {
            if (res === "Not Connected") {
                location.reload();
                return;
            }
            var json = JSON.parse(res);
            var name = json['name'];
            var table = document.getElementById("Ads");
            var firstRow = table.rows[0];
            var colsLen = firstRow.cells.length;
            row = findByAttributeValue("Ads", name, 0);
            for (var i = 1; i < colsLen; i++) {
                row.children[i].children[0].value = json[Object.keys(json)[i]];
            }
            alert(name + " advertisement updated successfully");
        },
        error: function (error) {
            console.log(error);
        }
    });
}


function cancelEditingAd() {
    var table = document.getElementById("Ads");
    if (table.tBodies[0].rows.length < 2) {
        return;
    }
    var editedRow = getEditedRow();
    if (editedRow == null) {
        return;
    }
    setAdFields(oldAd);
    disableRow(editedRow);


}

function disableRow(row) {
    len = row.cells.length;
    for (var i = 0; i < len; i++) {
        row.children[i].children[0].disabled = true;
    }

}

function unDisableRow(row) {
    len = row.cells.length;
    for (var i = 1; i < len; i++) {
        row.children[i].children[0].disabled = false;
    }
}



function getEditedRow() {
    var table = document.getElementById("Ads");
    var rowsLen = table.tBodies[0].rows.length;
    var firstRow = table.rows[0];
    var colsLen = firstRow.cells.length;
    var editedRow = null;

    for (var i = 1; i < rowsLen; i++) {
        var row = table.rows[i];
        for (var j = 0; j < colsLen; j++) {
            var cell = row.cells[j];
            var element1 = cell.children[0];
            if (!element1.disabled) {
                editedRow = row;
                i = rowsLen;
                break;
            }
        }


    }
    return editedRow;

}


function findByAttributeValue(attribute, value, elementType) {
    elementType = elementType || "*";
    var all = document.getElementsByTagName(elementType);
    for (var i = 0; i < all.length; i++) {
        if (all[i].getAttribute(attribute) == value) { return all[i]; }
    }
}



function validateName(name) {
    if (!isNullOrEmptyField
        (name)) {
        return false;
    }
    var namesRegex = /^(?![\s.]+$)[a-zA-Z\s.]*$/;
    if (!namesRegex.test(name)) {
        alert("Error; Enter a valid advertisement name with alphabets and spaces only");
        return false;
    }
    if (findByAttributeValue("Ads", name, "tr") != null) {
        alert("Error; The advertisement name is already exist");
        return false;
    }
    return true;


}

function validateText(text) {
    if (!isNullOrEmptyField
        (text)) {
        return false;
    }
    var textRegex = /^[\.a-zA-Z0-9,!?' ]*$/;
    if (!textRegex.test(text)) {
        alert("Error: Enter a valid text with letters, numbers, spaces, commas and periods only");
        return false;
    }
    if (text.split(",").length != 2) {
        alert("Error: The exact number of sentences separated by a comma is : 2");
        return false;
    }
    return true;

}


function validateImages(images) {
    if (!isNullOrEmptyField
        (images)) {
        return false;
    }

    if (images.split(",").length != 6) {
        alert("Error: The exact number of sentences separated by a comma is : 6");
        return false;
    }
    return true;

}

function validateDate(date) {
    if (!isNullOrEmptyField
        (date)) {
        return false;
    }
    var date_regex = /^([1-9]|1[0-2])\/([1-9]|1\d|2\d|3[01])\/\d{4}$/;
    if (!date_regex.test(date)) {
        alert("Error; Enter a valid datetime format (MM/DD/YYYY)");
        return false;
    }
    return true;

}

function validateDays(days) {
    if (!isNullOrEmptyField
        (days)) {
        return false;
    }
    var days_regex = /^[0-6](,[0-6])*$/;
    if (!days_regex.test(days)) {
        alert("Error; Only digits (0-6) seperated by commas are allowed");
        return false;
    }
    return true;

}

function validateHours(hours) {
    if (!isNullOrEmptyField
        (hours)) {
        return false;
    }

    var hours_regex = /^([0-9]|[1]\d|2[0-3])(,([0-9]|[1]\d|2[0-3]))*$/;
    if (!hours_regex.test(hours)) {
        alert("Error; Only digits (0-23) seperated by commas are allowed");
        return false;
    }
    return true;
}


function validateSeconds(seconds) {
    if (!isNullOrEmptyField
        (seconds)) {
        return false;
    }

    var seconds_regex = /^[0-9](,[0-9])*$/;
    if (!seconds_regex.test(seconds)) {
        alert("Error; Only digits (0-9) seperated by commas are allowed");
        return false;
    }
    return true;
}

function validateType(type) {
    if (!isNullOrEmptyField
        (type)) {
        return false;
    }

    if (!(type == "0" || type == "1" || type == "2")) {
        alert("Error; The type is not allowed, the valid types are : 0,1,2");
        return false;
    }
    return true;
}


function validateEditAndDelete(adName) {
    if (!isNullOrEmptyField
        (adName)) {
        return false;
    }
    if (findByAttributeValue("Ads", adName, "tr") == null) {
        alert("Error; The advertisement name does not exist");
        return false;
    }

    return true

}

function isNullOrEmptyField(str) {
    if (str == null) {
        return false;
    }
    if (str == "") {
        alert("Error; Field is empty");
        return false;
    }

    return true;
}


function getAdFieldsForDB(ad) {
    var table = document.getElementById("Ads");
    var firstRow = table.rows[0];
    adFields = {};

    adFields[firstRow.cells[0].innerHTML] = ad.children[0].children[0].value;
    adFields[firstRow.cells[1].innerHTML] = formatToList(ad.children[1].children[0].value);
    adFields[firstRow.cells[2].innerHTML] = formatToList(ad.children[2].children[0].value);
    adFields[firstRow.cells[3].innerHTML] = ad.children[3].children[0].value;
    adFields[firstRow.cells[4].innerHTML] = ad.children[4].children[0].value;
    adFields[firstRow.cells[5].innerHTML] = sortAndUnique(ad.children[5].children[0].value);
    adFields[firstRow.cells[6].innerHTML] = sortAndUnique(ad.children[6].children[0].value);
    adFields[firstRow.cells[7].innerHTML] = sortAndUnique(ad.children[7].children[0].value);
    adFields[firstRow.cells[8].innerHTML] = ad.children[8].children[0].value;
    return adFields;
}

function getAdFields(ad) {
    var table = document.getElementById("Ads");
    var firstRow = table.rows[0];
    var colsLen = firstRow.cells.length;
    adFields = {};
    for (var i = 0; i < colsLen; i++) {
        adFields[firstRow.cells[i].innerHTML] = ad.children[i].children[0].value;
    }
    return adFields;
}

function setAdFields(adFields) {
    var table = document.getElementById("Ads");
    var firstRow = table.rows[0];
    var colsLen = firstRow.cells.length;
    var ad = findByAttributeValue("Ads", adFields[firstRow.cells[0].innerHTML], "tr");
    for (var i = 1; i < colsLen; i++) {
        ad.children[i].children[0].value = adFields[firstRow.cells[i].innerHTML];
    }
}


function isAdChanged(oldAd, newAd) {
    var table = document.getElementById("Ads");
    var firstRow = table.rows[0];
    var colsLen = firstRow.cells.length;
    for (var i = 0; i < colsLen; i++) {
        if (oldAd[firstRow.cells[i].innerHTML] != newAd[firstRow.cells[i].innerHTML]) {
            return true;
        }
    }
    return false;
}

function sortAndUnique(input) {
    var inputFormated = JSON.parse('[' + input + ']');
    var inputSorted = inputFormated.sort(function (a, b) {
        return a - b;
    });;
    var uniqueInput = inputSorted.filter((v, i, a) => a.indexOf(v) === i);
    return uniqueInput;
}
function formatToList(input) {
    var text = input + "";
    var inputFormated = text.split(',');
    return inputFormated;
}
