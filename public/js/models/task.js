//-------------------------------------Functions for CRUD Operations-----------------

const getTask = async (searchText) => {
    var url = "/api/tasks"

    if(searchText && searchText != ""){
        url = "/api/tasks?search=" + searchText;
    }

    try{
        const response = await fetch(url);
        const tasks = await response.json();
    
        var taskHTML = "";
    
        if(tasks.length < 1){
            return document.querySelector("#task-wrapper").innerHTML = "<p>No task found!</p>";
        }
        
        tasks.forEach( (task) => {
    
            taskHTML += generateTaskCard(task);

            //$("#task-wrapper").html(taskHTML);
            document.querySelector("#task-wrapper").innerHTML = taskHTML;
    });
        
    }catch(e){
        console.log(e);
    }
    
}

const createTask = async () => {
    const url = "/api/tasks"

    const data = {
        description: document.querySelector("#description").value,
        completed : document.querySelector("#completed").checked
    }

    hideModal("create-modal");
    showLoader("#btn-add-task", {content : addingLoader});

    try{
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(data)
        });

        const task = await response.json();

        if(!task){
            return console.log("Unable to create task")
        }

        const taskCard = generateTaskCard(task);

        const taskList = document.querySelector("#task-wrapper");

        taskList.innerHTML = taskCard + taskList.innerHTML;

        showSuccess("Task created successfully");

    }catch(e){
        console.log(e);
        showError("Something went wrong");
    }finally{
        hideLoader("#btn-add-task", {content: "Add +"});
    }
}

const initiateUpdate = async (id) => {
    const url = "/api/tasks/"+ id;

    try{
        const response = await fetch(url);
        const task = await response.json();

        if(!task){
            return console.log("No task found");
        }

        document.querySelector("#updateDisc").value = task.description;
        document.querySelector("#update-completed").checked = task.completed;
        document.querySelector("#taskId").value = task._id;

        showModal("update-modal");

    }catch(e){
        console.log(e);
    }
}

const updateTask = async () => {

    const taskId = document.querySelector("#taskId").value;
    const url = "/api/tasks/"+ taskId;

    hideModal("update-modal");
    showLoader("#task-" + taskId + " .btn-primary", {content: generalLoader})

    const data = {
        description: document.querySelector("#updateDisc").value,
        completed : document.querySelector("#update-completed").checked
    }

    try{
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(data)
            
        });

        const task = await response.json();

        if(!task){
            return showError(task.error);
        }

        document.querySelector("#task-"+ task._id +" h5").textContent = task.description;

        document.querySelector("#task-"+ task._id).classList.remove("green-bg");

        if(task.completed){
            document.querySelector("#task-"+ task._id).classList.add("green-bg");
        }

        showSuccess("Task Updated successfully");

    }catch(e){
        console.log(e);
        showError("Something went wrong! Unable to Update task.")
    }finally{
        hideLoader("#task-" + taskId + " .btn-primary", {content: `<i class="fas fa-edit">`})
    }
}

const initiateDelete = (id) =>{
    
    swal({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this data!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
          deleteTask(id);
        }
      });
}

const deleteTask = async (id) => {
    const url = "/api/tasks/"+ id;

    showLoader("#task-" + id + " .btn-danger", {content: generalLoader});

    try{
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json"
            }            
        });
        const task = await response.json();

        if(!task){
            return showError(task.error);
        }

        document.querySelector("#task-"+ id).remove();
        showSuccess("Task deleted successfully");

    }catch(e){
        console.log(e);
        showError("Something went wrong");
    }finally{
        showLoader("#task-" + id + " .btn-danger", {content: `<i class="fas fa-trash-alt"></i>`});
    }
}


const generateTaskCard = (task) => {

    var color = task.completed == true ? "green-bg" : "";

    return `
            <div class="task-card ${color}" id="task-${task._id}">
                <h5>${task.description}</h5>
                <div class="crud-buttons">
                    <button class="btn btn-primary btn-sm" onclick="initiateUpdate('${task._id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="initiateDelete('${task._id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `
}

getTask();

const createForm = $("#create-task-form");
const updateForm = $("#update-task-form");
const searchForm = $("#search-form");


createForm.validate({
    rules: {
        description: {
            required : true
        }
    }
});

updateValidation = updateForm.validate({
    rules: {
        updateDisc: {
            required : true
        }
    }
});

createForm.on("submit", (e) => {
    e.preventDefault();

  if(createForm.valid()){
      createTask();
      createForm[0].reset;
  }
});
 
updateForm.on("submit", (e) => {
    e.preventDefault();

    if(updateForm.valid()){
        updateTask();   
        updateForm[0].reset;
    }
})

searchForm.on("submit", (e) => {
    e.preventDefault();

    const searchText = $("#search-form input").val();
    getTask(searchText);
})