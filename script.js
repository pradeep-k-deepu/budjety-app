let inputType = document.querySelector('.select');
let inputDescription = document.querySelector('.input__description');
let inputAmount = document.querySelector('.input__amount');
let incomesContainer = document.querySelector('.income__labels');
let expensesContainer = document.querySelector('.expense__labels');
let displayDate = document.querySelector('.display__date');
class Amount {
    date = new Date().toISOString();
    id;

    constructor(description,amount){
        this.description = description;
        this.amount = amount;
    }

    generateId(){
        this.id = Math.floor((1 + Math.random()) * 0x10000).toString(16).substr(1);
    }
}

class Income extends Amount{
    type = 'inc';
    constructor(description,amount){
        super(description,amount);
        this.generateId();
    }
}

class Expense extends Amount{
    type = 'exp';
    constructor(description,amount){
        super(description,amount);
        this.generateId();
    }
}




class App {
    #data = {
        "incomes": [],
        "expenses": [],
        "totalIncome": 0,
        "totalExpense": 0,
        "balance": 0,
        "percentage": 0,
        "percentages": [],
    }

    sort = false;
    constructor(){
        document.querySelector('.add__btn').addEventListener('click',this.#addData.bind(this));
        window.addEventListener('keydown',(e) => {
            if(e.key === 'Enter'){
                this.#addData();
            }
        })
        document.querySelector('.incomes__and__expenses').addEventListener('click',this.#deleteAndEdit.bind(this));
        window.addEventListener('load',this.#loadFunction.bind(this));
        document.querySelector('.sort__btn').addEventListener('click', () => {
            this.#sortFunction(!this.sort);
            this.sort = !this.sort;
        });

        this.#dateDisplay();
    }
   
    #sortFunction(sorted = false){
       
        let incomes =  sorted ? this.#data.incomes.slice().sort((a,b) => b.amount - a.amount) : this.#data.incomes;
        let expenses = sorted ? this.#data.expenses.slice().sort((a,b) => b.amount - a.amount) : this.#data.expenses;

        console.log(incomes,expenses);
        
        incomesContainer.innerHTML = '';
        expensesContainer.innerHTML = '';

    
        incomes.forEach(inc =>  this.#renderLabel(inc));
        expenses.forEach(exp =>  this.#renderLabel(exp));
      }


      #dateDisplay(){
        displayDate.textContent = new Intl.DateTimeFormat(navigator.language,{
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }).format(new Date());
      }

     #formatDate(date){
        let date1 = Date.now();
        let date2 = Date.parse(date);
        
        let days =  Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
        for(let i = 0; i <= days; i++){
            if(days != 0 && days < 7){
                return `${days} day${days === 1? '' : 's'} ago`;
            }else if(days === 0){
                return `today`;
            }else if(days != 0 && days === 7){
            return 'a week ago';
            }

            else{
                return new Intl.DateTimeFormat(navigator.language,{
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                        }).format(Date.parse(date));
            }
        }
     } 



    #clearFields(){
        inputDescription.value = inputAmount.value = '';
    }

    #loadFunction(){
        let incomes =  JSON.parse(localStorage.getItem('incomes'));
        let expenses = JSON.parse(localStorage.getItem('expenses'));



        
        if(incomes){
            this.#data.incomes = incomes;
        }
        if(expenses){
            this.#data.expenses = expenses;
        }

        this.#data.incomes.forEach(inc =>  this.#renderLabel(inc));
        this.#data.expenses.forEach(exp =>  this.#renderLabel(exp));


        this.#calculateTotal();

        this.#renderTotal();
    }


  

    #deleteAndEdit(e){
        let deleteIcon = e.target.closest('.delete');
        let editIcon = e.target.closest('.edit');
        if(deleteIcon){
            if(deleteIcon.parentElement.parentElement.parentElement.classList.contains('income__label')){
              this.#deleteOperation(deleteIcon,'incomes');
              this.#persistStorage('incomes');

            }

            if(deleteIcon.parentElement.parentElement.parentElement.classList.contains('expense__label')){
                this.#deleteOperation(deleteIcon,'expenses');
                this.#persistStorage('expenses');

            }
        }

        if(editIcon){
            if(editIcon.parentElement.parentElement.parentElement.classList.contains('income__label')){
                this.#editOperation(editIcon,'incomes');
                this.#persistStorage('incomes');

            }

            if(editIcon.parentElement.parentElement.parentElement.classList.contains('expense__label')){
                this.#editOperation(editIcon,'expenses');
                this.#persistStorage('expenses');

            }
        }
    }


    #deleteOperation(deleteIcon,type){
            //GETTING THE ID
            let id = deleteIcon.parentElement.parentElement.parentElement.dataset.id;

            //DELETE DATA IN THE DATASTRUCTURE
            let index =  this.#data[type].findIndex(inc => inc.id === id);
            this.#data[type].splice(index,1);

            //CACULATE TOTAL AND RENDER THE TOTAL 
            this.#calculateTotal();
            this.#renderTotal();

            //DELETE THE LABEL FROM THE USERINTERFACE
            deleteIcon.parentElement.parentElement.parentElement.remove();
    }

    #editOperation(editIcon,type){
          //GET THE ID
          let id = editIcon.parentElement.parentElement.parentElement.dataset.id; 

          //FIND THE INDEX OF THE OBJECT IN AN ARRAY U WANT TO EDIT
          let index =  this.#data[type].findIndex(inc => inc.id === id);

          inputType.value = this.#data[type][index].type;
          inputDescription.value = this.#data[type][index].description;
          inputAmount.value = this.#data[type][index].amount;  

          //DELETE OLD LABEL FROM DATA STRUCTURE
          this.#data[type].splice(index,1);
          
          //DELETE OLD LABEL FROM THE UI
          editIcon.parentElement.parentElement.parentElement.remove();
    }


    #formatNumber(number){
      return  new Intl.NumberFormat(navigator.language,{
            style: 'currency',
            currency: 'INR',
        }).format(number);
    }

    #calculateTotal(){
        //CALCULATE TOTAL INCOME
       this.#data['totalIncome'] = this.#data['incomes'].reduce((acc,inc) =>  acc + inc.amount,0);

        //CALCULATE TOTAL EXPENSE
        this.#data['totalExpense'] = this.#data['expenses'].reduce((acc,inc) =>  acc + inc.amount,0);

        //CALCULATE AVAILABLE BALANCE
        this.#data['balance'] = this.#data['totalIncome'] - this.#data['totalExpense'];

        //CALCULATE PERCENTAGE OF THE TOTAL EXPENSE LABEL
        this.#data["percentage"] = this.#data['totalExpense'] / this.#data['totalIncome'] * 100;

        //CALCULATE PERCENTAGES
    //    this.#data["percentages"] = this.#data['expenses'].map(exp => exp.amount).map(expAmt => expAmt / this.#data["totalIncome"] * 100);

     this.#data['expenses'].map(exp => exp.amount).map(expAmt => expAmt / this.#data["totalIncome"] * 100).forEach((per,i) => this.#data.expenses[i].percentage = per);

    }

    #renderTotal(){
        //RENDER AVAILABLE BALANCE
        document.querySelector('.top__balance__label').textContent = this.#formatNumber(this.#data['balance']); 

        //RENDER TOTAL INCOME   
        document.querySelector('.total__income').textContent = this.#formatNumber(this.#data['totalIncome']);  

        //RENDER TOTAL EXPENSE  
        document.querySelector('.total__expense').textContent = this.#formatNumber(this.#data['totalExpense']); 
        
        //RENDER PERCENTAGE ON TOTAL EXPENSE LABEL
       
        if(this.#data['percentage'] > 0 && Number.isFinite(this.#data['percentage'])){
            document.querySelector('.top__expense__percentage').textContent = `${Math.trunc(this.#data['percentage'])}%`;
        }else{
            document.querySelector('.top__expense__percentage').textContent = `-`;
        }
    }

   
    
    #persistStorage(type){
        localStorage.setItem(type,JSON.stringify(this.#data[type]));
    }

    #addData(){
        //VALIDATING DATA
        if(!inputDescription.value || !inputAmount.value) return alert('both fields are required');
        if(Number.isFinite(+inputDescription.value)) return alert ('numbers are not allowed in description');
        if(!Number.isFinite(+inputAmount.value)) return alert('only numbers are allowed in amount field');


        //IF THE TYPE IS INCOME THEN CREATE INCOME OBJECT AND ADD IT TO THE DATA[INCOMES] OBJECT
        if(inputType.value === 'inc'){
            let incomeObject = new Income(inputDescription.value,+inputAmount.value);
           
            this.#data['incomes'].push(incomeObject);

       this.#calculateTotal();

            this.#persistStorage('incomes');
            this.#renderLabel(incomeObject);
        }
        //IF THE TYPE IS EXPENSE THEN CREATE EXPENSE OBJECT AND ADD IT TO THE DATA[EXPENSES] OBJECT
        else{
            let expenseObject = new Expense(inputDescription.value,+inputAmount.value);
           
            this.#data['expenses'].push(expenseObject);

       this.#calculateTotal();

            this.#persistStorage('expenses');
            this.#renderLabel(expenseObject);
        }

       

       this.#clearFields();


       this.#renderTotal();
      
      
    }

    #renderLabel(data){ 
        let html = ` 
            <div class="${data.type === 'inc'? 'income' : 'expense'}__label" data-id="${data.id}">
                <div class="${data.type === 'inc'? 'income' : 'expense'}__description">${data.description}</div>
                <div class="${data.type === 'inc'? 'income' : 'expense'}__date">${this.#formatDate(data.date)}</div>
                <div class="${data.type === 'inc'? 'income' : 'expense'}__value">${this.#formatNumber(data.amount)}
            </div>`;
        
            if(data.type === 'inc'){
            html += ` 
            <div class="icons">
                <div class="edit__icon"><i class="edit fa fa-pencil-square-o" aria-hidden="true"></i></div>
                <div class="delete__icon"><i class="delete fa fa-trash-o" aria-hidden="true"></i></div>
            </div>
            </div>`;

            incomesContainer.insertAdjacentHTML('afterbegin',html);

            }

            if(data.type === 'exp'){
                html+= `
                <div class="expense__percentage">${Math.trunc(data.percentage)}%</div>
                <div class="icons">
                    <div class="edit__icon"><i class="edit fa fa-pencil-square-o" aria-hidden="true"></i></div>
                    <div class="delete__icon"><i class="delete fa fa-trash-o" aria-hidden="true"></i></div>
                </div> 
                </div>`;
                expensesContainer.insertAdjacentHTML('afterbegin',html);

            }
    }


}


let app = new App();





