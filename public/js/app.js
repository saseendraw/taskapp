
//-------------------------------------Global re-usable variables data--------------
const addingLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Adding...`;

const generalLoader = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;    



//------------------------------------- Utility Functions-----------------

const showModal = (id, data) => {
    
    $("label.error").hide();
    $(".error").removeClass("error");
    $('#'+ id).modal();
}

const hideModal = (id, data) => {
    $('#'+ id).modal("hide");
}

const showSuccess = (message, data) => {
    toastr.success(message);
}

const showError = (message, data) => {
    toastr.error(message);
}

const showLoader = (selector, data) =>{
    document.querySelector(selector).innerHTML = data.content;
    document.querySelector(selector).disabled = true;
}

const hideLoader = (selector, data) =>{
    document.querySelector(selector).innerHTML = data.content;
    document.querySelector(selector).disabled = false;
}

