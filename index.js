const inquirer = require('inquirer');
const mysql = require('mysql2');

//initalize the database and log in
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
  );

const menuQuestion = [
    {
        type: 'list',
        name: 'next',
        message: 'Would you like to: ',
        choices: ['View All Employees', 'Add Employees', 'Update Employee Role', 'View all Roles', 'Add Role', 'View all Departments', 'Add Department', 'Quit'],
    }
];

const addDepartmentQuestions = [
    {
        type: 'input',
        name: 'name',
        message: "Enter the name of the department: ",
    },
];

const addRoleQuestions = [
    {
        type: 'input',
        name: 'title',
        message: "Enter the title of the role: ",
    },
    {
        type: 'input',
        name: 'salary',
        message: "Enter the salary of the role: ",
    },
];

//This function shows all the employees in the db
function viewAllEmployees() {

};

//This function shows all the roles in the db
function viewAllRoles() {
    db.query('SELECT * FROM roles', function(err, results){
        console.log(results);
        menu();
    });
};

//This function shows all the departments in the db
function viewAllDepartments() {
    db.query('SELECT * FROM departments', function(err, results){
        console.log(results);
        menu();
    });
};

//Adds an employee to the database
function addEmployee() {

};

//Adds a role to the database
function addRole() {
    db.query('SELECT * FROM departments', function(err, results){
        //create an array that will hold the current departments in the sql database
        var departments = [];
        //loop through the results array and grab all the department names
        for(let i = 0; i < results.length; i++) {
            departments.push(results[i].name);
        }
        //create a question using the returned departments
        const depQuestion = {
            type: 'list',
            name: 'department',
            message: 'Which department is this role a part of? ',
            choices: departments,
        }
        //push the question onto the other questions so we ask it in inquirer
        addRoleQuestions.push(depQuestion);
        //ask the questions for the role
        inquirer
        .prompt(addRoleQuestions).then((answers) => {
            //get the id of the department the user selected
            var id = results[departments.indexOf(answers.department)].id;
            db.query(`INSERT INTO roles (title, salary, department_id) values (?, ?, ?)`, ([answers.title, answers.salary, id]), function(err, results){
                console.log("Added " + answers.title + " into the database.")
                addRoleQuestions.pop();
                menu();
            });
        });
    });
};

//Adds a department to the database
function addDepartment() {
    inquirer
    .prompt(addDepartmentQuestions).then((answers) => {
        db.query(`INSERT INTO departments (name) values (?)`, answers.name, function(err, results){
            console.log("Added " + answers.name + " into the database.");
            menu();
        });
    });
}

//Updates the employee info in the database
function updateEmployee() {

}

//Updates the role info in the database
function updateRole() {

}

//this function handles the menu for selecting what we want to do
function menu() {
    inquirer
    .prompt(menuQuestion).then((answers) => {
        switch (answers.next) {
            case 'View All Employees':
                break;
            case 'Add Employees':
                break;
            case 'Update Employee Role':
                break;
            case 'View all Roles':
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View all Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            default:
                db.end();
                return;
        }
    });
}

menu();