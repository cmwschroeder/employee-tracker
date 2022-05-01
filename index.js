const inquirer = require('inquirer');
const mysql2 = require('mysql2');

const menuQuestion = [
{
    type: 'list',
    name: 'next',
    message: 'Would you like to: ',
    choices: ['View All Employees', 'Add Employees', 'Update Employee Role', 'View all Roles', 'Add Role', 'View all Departments', 'Add Department'],
}
];

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
        }
    })
}

menu();