function toggleSubmit() {
    var checkbox = document.getElementById("PUL");
    var submitButton = document.getElementById("submitButton");
    if (checkbox.checked) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

var error = false;
function verifyForm() {
    error = false;
    VerifyValue("phone", "Du måste ange ett telefonnummer");
    VerifyValue("location", "Du måste ange en ort");
    VerifyValue("age", "Du måste ange din ålder");
    VerifyValue("email", "Du måste ange en epost");
    VerifyValue("lastName", "Du måste ange ett efternamn");
    VerifyValue("firstName", "Du måste ange ett namn");

    var checked = $("#organisation input:checked").length > 0;
    //console.log(checked);
    if (!checked) {
        SetInnerHtml("organisation-error", "Du måste välja minst en organisation");
        error = true;
        SetFocus("FRO");
    }
    else {
        SetInnerHtml("organisation-error", "");
    }
        return !error;
    }

    function GetValue(field) {
        return document.getElementById(field).value
    }
    function SetFocus(field) {
        return document.getElementById(field).focus()
    }
    function SetValue(field, value) {
        document.getElementById(field).value = value;
    }
    function SetInnerHtml(field, value) {
        document.getElementById(field).innerHTML = value;
    }

    function VerifyValue(field, errorMessage) {
        var msg = "";
        if (GetValue(field) == "" || GetValue(field) == null) {
            msg = errorMessage;
            error = true;
            SetFocus(field);
        } else {
            SetInnerHtml(field + "-error", "");
        }
        SetInnerHtml(field + "-error", msg);
    }