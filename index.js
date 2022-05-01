const inquirer = require('inquirer');
const mysql2 = require('mysql2');

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

};

//Adds an employee to the database
function addEmployee() {

};

//Adds an role to the database
function addRole() {

};

//Adds an department to the database
function addDepartment() {

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
                break;
            case 'Add Department':
                break;
            default:
                break;
        }
    })
}

menu();