
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

$('#taskDueDate').datepicker({})

function generateTaskId()  {

    if (!nextId) {
        nextId = 0
    }
    
    const newId = nextId;
    nextId++;
    localStorage.setItem('nextId', JSON.stringify(nextId));
    return newId;
}

function createTaskCard(task) {
   
    if (!taskList) {
        return
    }
    
    const taskCard = document.createElement('div');
    taskCard.setAttribute('class','taskCard');
    let taskId = task.id
    taskCard.setAttribute('id', `taskId-${taskId}`)

    const taskCardHeader = document.createElement('div')
    taskCardHeader.setAttribute('class','taskCardHeader')
    const cardDeleteButton = document.createElement('button')
    cardDeleteButton.textContent = 'x'
    cardDeleteButton.setAttribute('class','cardDeleteButton')
    cardDeleteButton.addEventListener('click', handleDeleteTask);

    const taskTitle = document.createElement('h4');
    taskTitle.textContent = task.title;
    taskTitle.setAttribute('id','taskTitle');

    const taskDescription = document.createElement('p');
    taskDescription.textContent = task.description;
    taskDescription.setAttribute('id','taskDescription');

    const taskDueDate = document.createElement('p');
    taskDueDate.textContent = task.dueDate;
    taskDueDate.setAttribute('id','taskDueDate');

    taskCard.setAttribute('id', `taskId-${taskId}`)

    taskCardHeader.appendChild(taskTitle);
    taskCard.appendChild(cardDeleteButton);
    taskCard.appendChild(taskCardHeader);
    taskCard.appendChild(taskDescription);
    taskCard.appendChild(taskDueDate);
    
    const taskStatus = task.status
    let taskColumnPick = document.getElementById(`${taskStatus}-cards`)
    taskColumnPick.appendChild(taskCard);
   
    renderTaskList();
   
    function updateTaskCardColor(task) {
        const taskCard = document.getElementById(`taskId-${task.id}`);
        if (taskCard) {
            const dueDate = dayjs(task.dueDate);
            const currentDate = dayjs();
        
            const dayDifference = dueDate.diff(currentDate, 'day');
        
            if (dayDifference <= 0) {
                taskCard.classList.add('past-due');
            } else if (dayDifference <= 2) {
                taskCard.classList.add('due-soon');
            } else { taskCard.classList.add('due-later')}
        };
    };
 
    updateTaskCardColor(task);
}



function renderTaskList()  {
 
    $('.taskCard').draggable({
        revert: 'invalid',
        zIndex: 100,
        connectToSortable: '.lane',
    });
 
    $('#to-do-cards').sortable({
        appendTo: document.body
    });

}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    
    event.preventDefault();
  
   
    const title = $('#taskTitle').val().trim();
    const description = $('#taskDescription').val().trim();
    const dueDateStr = $('#taskDueDate').datepicker('getDate');
   
    const dueDateISO = dueDateStr.toISOString().split('T')[0];

    const dueDate = dayjs(dueDateISO)
   
    const newTask = {
      id: generateTaskId(),
      title: title,
      description: description,
      dueDate: dueDate.format('YYYY-MM-DD'),
      status: 'to-do'
    };
}

function handleDeleteTask(event) { 
    
    const deleteButton = event.target;
    const taskCard = deleteButton.closest('.taskCard');
    const taskId = taskCard.id.replace('taskId-', '')

    const taskIndex = taskList.findIndex(task => task.id === parseInt(taskId));

    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1); 
        localStorage.setItem('tasks', JSON.stringify(taskList));
    }

    taskCard.remove();

}
    function handleDrop(event, ui) {
        
        event.stopPropagation();
       
        const taskId = ui.draggable.attr('id').replace('taskId-', '');
        const newStatus = $(this).attr('id');
      
        const taskIndex = taskList.findIndex((task) => task.id === parseInt(taskId));  
        if (taskIndex !== -1) {
            taskList[taskIndex].status = newStatus;
            localStorage.setItem('tasks', JSON.stringify(taskList));
        };
    }
    

    $(document).ready(function () {
        // We render our tasks from our local storage
        function renderTasksFromLocalStorage() {
            // We check if there's data stored in our local storage and create a task card for each task if there is
            if (taskList) {
                taskList.forEach((task, index) => {
                    createTaskCard(taskList[index]); 
                });
            }
        }
        
        renderTasksFromLocalStorage()
       
       
        $('.lane').sortable({
            connectWith: '.lane',
            tolerance: 'pointer',
            handle: '.taskCardHeader',
            cursor: 'move',
            placeholder: 'taskCard-placeholder'
        })
       
        $('.lane').droppable({
            accept: '.taskCard',
            drop: handleDrop,
        });
     
        $('#addTaskButton').click(function() {
            $('#formModal').modal('show');
        });
       
        $('#taskForm').submit(handleAddTask);
    });

