// DOM OBJECTS
const headerTitle = document.querySelector("header>h1");
const drawingPin = document.querySelector("img.drawing-pin");
const addTaskBtn = document.querySelector("i.new-task");
const addTaskForm = document.querySelector(".new-task-form");
const addTaskFormBtn = document.querySelector(".new-task-form>button");
const tasksList = document.querySelector("main>ul");
const noTaskNotice = document.querySelector(".no-task");
const tasksSummary = document.querySelector(".tasks-summary");
const searchInput = document.querySelector(".search-box>.search-input");
const tasks = [];
const defaultAnimationTime = 1000;
let fadeOutMsg = "";
let addTaskFormData = false;
let taskId = tasks.length;
let editingInProgress = false;

// FUNCTIONS
const addTaskAnimate = e => {
    if (addTaskFormData instanceof Array) {
        setTimeout(() => {
            addTaskFormData[0].style.borderColor = "";
            addTaskFormData[1].style.borderColor = "";
            addTaskFormData[2].textContent = "";
            addTaskFormData = false;
        }, defaultAnimationTime)
    }

    let timeoutTime = 0;

    if (addTaskBtn.classList.contains("animated")) {
        timeoutTime = 400;
        addTaskBtn.classList.remove("animated");
    }

    setTimeout(() => {
        e.target.removeEventListener("click", addTaskAnimate);
        e.target.classList.toggle("cancel-task");
        headerTitle.classList.toggle("fade-out");
        addTaskForm.classList.toggle("shown");
    }, timeoutTime);



    setTimeout(() => {
        e.target.addEventListener("click", addTaskAnimate);
    }, defaultAnimationTime)
}

const drawingPinAnimate = e => {
    e.target.removeEventListener("click", drawingPinAnimate);
    drawingPin.classList.add("animate");

    setTimeout(() => {
        drawingPin.classList.remove("animate");
        e.target.addEventListener("click", drawingPinAnimate);
    }, defaultAnimationTime);
}

const addNewTask = e => {
    const input = e.target.parentNode.querySelector("input");
    const validateMsg = e.target.parentNode.querySelector(".validate-msg");

    validateMsg.style.opacity = 1;
    inputValue = input.value.trim();

    if (inputValue.length < 1) {
        e.target.style.borderColor = "var(--redColor)";
        input.style.borderColor = "var(--redColor)";
        validateMsg.dataset.action = "error";
        validateMsg.textContent = "Want to do something before planning it!";

        if (fadeOutMsg)
            clearTimeout(fadeOutMsg);
    } else {
        const dateTimeHandler = new Date();
        const taskDate = dateTimeHandler.toLocaleDateString();
        const taskHour = (dateTimeHandler.getHours() < 10) ? `0${dateTimeHandler.getHours()}` : dateTimeHandler.getHours();
        const taskMinutes = (dateTimeHandler.getMinutes() < 10) ? `0${dateTimeHandler.getMinutes()}` : dateTimeHandler.getMinutes();
        const taskDateTime = `${taskDate} ${taskHour}:${taskMinutes}`;

        tasks.push({
            id: ++taskId,
            datetime: taskDateTime,
            content: inputValue,
            checked: false
        });

        e.target.style.borderColor = "";
        input.value = "";
        input.style.borderColor = "";
        validateMsg.dataset.action = "success";
        validateMsg.textContent = "The task has been successfully added!";

        if (fadeOutMsg)
            clearTimeout(fadeOutMsg);

        fadeOutMsg = setTimeout(() => validateMsg.style.opacity = 0, 3000);

        showTasks();

        const recentlyAddedTask = document.querySelector(`main>ul>li[data-task-id="${taskId}"]`);
        recentlyAddedTask.classList.add("task-recently-added");
        recentlyAddedTask.style.transition = ".4s";
        setTimeout(() => {
            recentlyAddedTask.classList.remove("task-recently-added");
            setTimeout(() => recentlyAddedTask.style.transition = "", 300);
        }, defaultAnimationTime);

    }

    return addTaskFormData = [e.target, input, validateMsg];
}

const showTasks = tasksToDisplay => {
    if (editingInProgress !== false)
        turnOffEditForm(editingInProgress);

    tasksList.innerHTML = "";

    let tasksNumber, tasksToDoNumber, tasksCompletedNumber;
    tasksNumber = 0;
    tasksToDoNumber = 0;
    tasksCompletedNumber = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (typeof tasks[i] === "object") {
            tasksNumber++;

            if (tasks[i].checked)
                tasksCompletedNumber++
            else
                tasksToDoNumber++;
        }
    }

    if (tasksNumber === 0) {
        searchInput.value = "";
        searchInput.disabled = true;
        noTaskNotice.innerHTML = "Add your first task!";
        noTaskNotice.classList.add("shown");
        tasksSummary.classList.remove("shown");

        if (!addTaskBtn.classList.contains("cancel-task"))
            addTaskBtn.classList.add("animated");

        return;
    } else {
        noTaskNotice.classList.remove("shown");
        searchInput.disabled = false;

        const summarySections = tasksSummary.querySelectorAll("span");
        summarySections[0].innerHTML = tasksNumber; // total
        summarySections[1].innerHTML = tasksToDoNumber; // to be done
        summarySections[2].innerHTML = tasksCompletedNumber; // completed
        tasksSummary.classList.add("shown");
    }


    if (!(tasksToDisplay instanceof Array))
        if (searchInput.value.length < 1)
            tasksToDisplay = tasks;
        else {
            searchTasks(searchInput.value);
            return 0;
        }
    else {
        if (tasksToDisplay.length < 1) {
            noTaskNotice.innerHTML = "No results...";
            noTaskNotice.classList.add("shown");
            return;
        } else
            noTaskNotice.classList.remove("shown");
    }

    for (task of tasksToDisplay) {
        if (task === "deleted")
            continue;

        const listItem = document.createElement("li");
        let checkedIcon;

        listItem.setAttribute("data-task-id", task.id)

        if (task.checked) {
            listItem.classList.add("task-checked");
            checkedIcon = "fas fa-ban task-uncheck-btn";
        } else
            checkedIcon = "fas fa-check-circle task-check-btn";

        listItem.innerHTML = `
        <div class="task">
            <div class="task-content">
                <div class="task-datetime moved">
                    ${task.checked ? '<i class="fas fa-check-circle task-checked-icon"></i>' : ''} ${task.datetime} 
                </div>
                <div class="task-description">${task.content}</div>
            </div>
            <div class="task-navigation">
                <i class="${checkedIcon} task-change-state"></i>
                <i class="fas fa-edit task-edit"></i>
                <i class="fas fa-trash task-delete"></i>
            </div>
        </div>
        `;

        tasksList.appendChild(listItem);

        const navigationAreas = document.querySelectorAll(".task-navigation");

        navigationAreas.forEach(navigationArea => {
            navigationArea.addEventListener("click", captureNavAction);
        });
    }

    return tasksNumber;
}

const captureNavAction = e => {
    if (e.target.tagName.toLowerCase() != "i") return;

    let liElement = e.target;

    while (!liElement.getAttribute("data-task-id"))
        liElement = liElement.parentNode;

    const taskIdAction = liElement.getAttribute("data-task-id");
    const btnClasses = e.target.classList;

    switch (btnClasses[btnClasses.length - 1]) {
        case "task-change-state":
            changeTaskState(taskIdAction);
            break;

        case "task-delete":
            deleteTask(taskIdAction);
            break;

        case "task-edit":
            editTask(taskIdAction);
            break;
    }
}

const changeTaskState = taskId => {
    tasks[taskId - 1].checked = !(tasks[taskId - 1].checked);
    showTasks();
}

const deleteTask = taskId => {
    if (window.confirm("Are you sure to delete the task?")) {
        tasks.splice(taskId - 1, 1, "deleted");
        showTasks();
    } else return;
}

const editTask = taskId => {
    if (editingInProgress === taskId) {
        turnOffEditForm(taskId);
        return;
    } else if (editingInProgress !== false)
        turnOffEditForm(editingInProgress);

    let currentTaskContent = document.querySelector(`[data-task-id="${taskId}"] .task-description`);
    editingInProgress = taskId;

    currentTaskContent.innerHTML = `<textarea>${currentTaskContent.innerHTML}</textarea>
    <button class="edit-form-btn apply-edit">Apply changes</button>
    <button class="edit-form-btn cancel-edit">Cancel</button>`;

    const newContent = currentTaskContent.querySelector("textarea");
    const applyChangesBtn = currentTaskContent.querySelector("button.apply-edit");

    newContent.addEventListener("input", () =>
        newContent.value.length === 0 ?
            applyChangesBtn.disabled = true :
            applyChangesBtn.disabled = false);

    document.querySelectorAll(".edit-form-btn").forEach(button => {
        button.addEventListener("click", e => {
            if (e.target === applyChangesBtn) {
                if (newContent.value.trim().length > 0) {
                    tasks[taskId - 1].content = newContent.value;
                    showTasks();
                }
            } else
                turnOffEditForm(taskId);
        });
    });
}

const turnOffEditForm = taskId => {
    let pointedTaskContent = document.querySelector(`[data-task-id="${taskId}"] .task-description`);
    let pointedTaskTextareaContent = document.querySelector(`[data-task-id="${taskId}"] .task-description>textarea`);

    editingInProgress = false;
    pointedTaskContent.innerHTML = pointedTaskTextareaContent.innerHTML;
}

const searchTasks = phrase => {
    if (typeof phrase === "object")
        phrase = phrase.target.value;

    let checkIfAnyTaskExist = false;

    for (let i = 0; i < tasks.length; i++) {
        if (typeof tasks[i] === "object") {
            checkIfAnyTaskExist = true;
            break;
        }
    }

    if (checkIfAnyTaskExist) {
        let foundTasks = tasks.filter(task =>
            typeof task === "object" && task.content.toLowerCase().includes(phrase.toLowerCase()));

        showTasks(foundTasks);
    }
}

const todoInit = () => {
    const mainContainer = document.querySelector(".container");
    const loader = document.querySelector(".loader");

    window.addEventListener("load", (e) => {
        mainContainer.style.transition = "transform .5s";
        setTimeout(() => {
            loader.style.opacity = 0;
            mainContainer.style.transform = "scale(1)";
            showTasks();
        }, defaultAnimationTime)
    })
}

// INITIALIZATION 
todoInit();

// LISTENERS
drawingPin.addEventListener("click", drawingPinAnimate);
addTaskBtn.addEventListener("click", addTaskAnimate);
addTaskFormBtn.addEventListener("click", addNewTask);
searchInput.addEventListener("input", searchTasks);