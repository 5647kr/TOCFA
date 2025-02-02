class Todo {
  constructor () {
    const main = document.querySelector("main .wrap");
    this.dateList = main.querySelector(".dateListWrap ul");
    this.todo = main.querySelectorAll(".todoWrap article");
    this.todoTitle = main.querySelectorAll(".todoTitleWrap h2");
    this.editTitleBtn = main.querySelectorAll(".todoTitleWrap button");
    this.todoInput = main.querySelectorAll(".formWrap input");
    this.regBtn = main.querySelectorAll(".regBtn");
    this.todoList = main.querySelectorAll("[class^= todoListWrap]");

    this.todoTitles = JSON.parse(localStorage.getItem("todoTitles"))

    this.todoArr = JSON.parse(localStorage.getItem("todoArr")) || [];
    this.todoId = JSON.parse(localStorage.getItem("todoId")) || 0;
    this.editTodoId = null;
    this.currentDate = null;

    this.todoState = JSON.parse(localStorage.getItem("todoState"));

  }

  TodoEvent() {
    this.dateGenerate();
    this.displayTodoTitles();
    this.manageTodoData();
    this.displayTodoList();
  }

  displayTodoTitles() {
    this.todoTitle.forEach((todoTitle, index) => {
      todoTitle.textContent = this.todoTitles[index];
    });

    this.editTitleBtn.forEach((btn, index) => {
      btn.addEventListener("click", () => this.editTodoTitle(index));
    })
  }

  editTodoTitle(index) {
    const currentTitle = this.todoTitles[index];
    const newTitle = prompt("제목을 수정하세요", currentTitle);

    if (newTitle !== null && newTitle.trim() !== "") {
      this.todoTitles[index] = newTitle.trim();
      localStorage.setItem("todoTitles", JSON.stringify(this.todoTitles));
      this.displayTodoTitles();
    }
  }

  dateGenerate() {
    const newDate = new Date();
    const year = newDate.getFullYear();
    const month = newDate.getMonth(); //여기수정
    const date = newDate.getDate();
    
    const startDate = new Date(year, month, 1).getDate();
    const endDate = new Date(year, month + 1, 0).getDate();

    this.currentDate = `${month + 1}/${date}`; 
    
    this.dateList.innerHTML = "";
  
    // 날짜 목록 생성
    for (let i = startDate; i <= endDate; i++) {
      // li 요소와 button 요소 생성
      const dateItem = document.createElement("li");
      const button = document.createElement("button");
      button.textContent = i;
      
      if (i === date) {
        dateItem.classList.add("active");
        dateItem.focus();
      }
      
      dateItem.appendChild(button);
  
      button.addEventListener("click", () => {
        const activeLi = this.dateList.querySelector("li.active");
        if (activeLi) {
          activeLi.classList.remove("active");
        }
        dateItem.classList.add("active");

        this.currentDate = `${month + 1}/${i}`

        this.displayTodoList();
      });
  
      this.dateList.appendChild(dateItem);
    }

    const todayLi = this.dateList.querySelector("li.active");
    if (todayLi) {
      setTimeout(() => {
        todayLi.scrollIntoView({
          behavior: "smooth", // 스크롤 애니메이션
          block: "center", // 화면 중앙으로 스크롤
          inline: "center" // 수평 스크롤 시에도 중앙 정렬
        });
      }, 0);
    }
  }
  
  manageTodoData() {
    this.regBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const article = e.target.closest("article");
        const key = article.className.split("-")[1]
        const title = article.querySelector("input").value.trim();
        const done = false;
        const date = this.currentDate;
        const id = this.todoId;

        const props = { key, title, done, date, id }

        if(this.editTodoId === null) {
          this.regTodo(props);
          this.updateTodoState();
        } else {
          this.updateTodo(this.editTodoId);
        }
      })
    })

    // 초기화날 설정
    if(this.todoArr.length !== 0 && this.currentDate.split("/")[1] === "1") {
      const newMonthTodoArr = this.todoArr.some((item) => item.date.split("/")[0] !== this.currentDate.split(("/")[0]));

      if(newMonthTodoArr) {
        this.manageTodoList();
        this.updateTodoState();
      }

    } else {
      this.updateTodoState();
    }
  }

  regTodo(props) {
    const todoItemData = {
      id: props.id,
      date: props.date,
      title: props.title,
      done: props.done,
      key: props.key
    }
    
    this.todoArr.push(todoItemData);
    
    localStorage.setItem("todoArr", JSON.stringify(this.todoArr))
    localStorage.setItem("todoId", JSON.stringify(++this.todoId))
    
    this.resetInput();
    this.createTodoItem(todoItemData);
  }

  createTodoItem(todoItemData) {
    const todoItem = document.createElement("li");
    const todoItemContent = `
      <input type="checkbox" id="todo-${todoItemData.id}">
      <label for="todo-${todoItemData.id}">${todoItemData.title}</label>
      <div class="btnWrap">
        <button class="editBtn">
          <i class="fa-solid fa-pencil"></i>
        </button>
        <button class="deleteBtn">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    todoItem.innerHTML = todoItemContent;
    todoItem.id = todoItemData.id;

    const checkbox = todoItem.querySelector("input[type=checkbox]");
    checkbox.checked = todoItemData.done;

    this.manageTodoItem(todoItem);

    this.todoList.forEach((list) => {
      const listKey = list.className.split("-")[1]
      if(listKey === todoItemData.key) {
        list.appendChild(todoItem)
      }
    })
  }

  displayTodoList() {
    this.todoList.forEach((list) => {
      list.innerHTML = "";
    })
  
    const todayTodo = this.todoArr.filter((todoItem) => {
      const todayItem = todoItem.date.split("/")[1];
      return todayItem === this.currentDate.split("/")[1];
    });
    
    todayTodo.forEach((todoItemData) => {
      this.createTodoItem(todoItemData)
    })
  }

  manageTodoItem(todoItem) {
    const check = todoItem.querySelector("input[type=checkbox]");
    const editBtn = todoItem.querySelector(".btnWrap .editBtn");
    const delBtn = todoItem.querySelector(".btnWrap .deleteBtn");

    check.addEventListener("click", () => this.checkTodo(todoItem))
    editBtn.addEventListener("click", () => this.editTodo(todoItem))
    delBtn.addEventListener("click", () => this.deleteTodo(todoItem.id))
  }

  checkTodo(todoItem) {
    const checkItem = this.todoArr.find(item => item.id === parseInt(todoItem.id));

    checkItem.done = !checkItem.done;

    localStorage.setItem("todoArr", JSON.stringify(this.todoArr));

    this.updateTodoState();
  }

  editTodo(todoItem) {
    const editItem = this.todoArr.find(item => item.id === parseInt(todoItem.id));
    const editInput = Array.from(this.todoInput).find((input) => {
      return editItem.key === input.id;
    })

    if(editItem) {
      editInput.value = editItem.title;
  
      this.editTodoId = editItem.id;
    }
  }

  updateTodo(id) { 
    const updateTodo = this.todoArr.find(item => item.id === parseInt(id));

    const editInput = Array.from(this.todoInput).find((input) => {
      return updateTodo.key === input.id;
    })

    if(updateTodo) {
      updateTodo.title = editInput.value;

      localStorage.setItem("todoArr", JSON.stringify(this.todoArr));

      this.displayTodoList();

      this.editTodoId = null;

      this.resetInput();

    }
  }

  deleteTodo(id) {
    this.todoArr = this.todoArr.filter(item => item.id !== parseInt(id));

    localStorage.setItem("todoArr", JSON.stringify(this.todoArr));

    const li = document.getElementById(id);
    if(li) {
      li.remove();
    }

    this.displayTodoList();

    this.updateTodoState();
  }
  
  updateTodoState() {
    const date = new Date();
    const stateMonth = date.getMonth(); //여기수정
    let updateState = this.todoState[stateMonth];
    
    if(updateState) {
      // 해당달 데이터 초기화
      updateState = {
        "list1": "0/0", 
        "list2": "0/0",
        "list3": "0/0",
        "list4": "0/0"
      };

      this.todoArr.forEach((item) => {
        const key = item.key
        
        if (updateState[key]) {
          let [completed, total] = updateState[key].split("/").map(Number);
          
          total = this.todoArr.filter((todo) => todo.key === key).length;
          
          if (item.done) {
            completed++;
          }
          
          updateState[key] = `${completed}/${total}`;

        }
      })
      this.todoState[stateMonth] = updateState;

      localStorage.setItem("todoState", JSON.stringify(this.todoState));
    }
  }

  manageTodoList() {
    const newMonth = new Date().getMonth() + 1; //여기수정
    this.todoArr = this.todoArr.filter(item => parseInt(item.date.split("/")[0]) === newMonth);

    localStorage.setItem("todoArr", JSON.stringify(this.todoArr));
  }


  resetInput() {
    this.todoInput.forEach((input) => {
      input.value = ""
    })
  }
}

const todo = new Todo();
todo.TodoEvent();
