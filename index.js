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

//This function shows all the employees in the db
function viewAllEmployees() {

};

//This function shows all the roles in the db
function viewAllRoles() {

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

//Adds an role to the database
function addRole() {

};

//Adds an department to the database
function addDepartment() {
    inquirer
    .prompt(addDepartmentQuestions).then((answers) => {
        db.query(`INSERT INTO departments (name) values (?)`, answers.name, function(err, results){
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
                break;
            case 'Add Role':
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