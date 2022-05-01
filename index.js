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

const addEmployeeQuestions = [
    {
        type: 'input',
        name: 'firstName',
        message: "Enter the first name of the employee: ",
    },
    {
        type: 'input',
        name: 'lastName',
        message: "Enter the last name of the employee: ",
    },
]

//This function shows all the employees in the db
function viewAllEmployees() {
    db.query('SELECT * FROM employees', function(err, results){
        console.table(results);
        menu();
    });
};

//This function shows all the roles in the db
function viewAllRoles() {
    db.query('SELECT * FROM roles', function(err, results){
        console.table(results);
        menu();
    });
};

//This function shows all the departments in the db
function viewAllDepartments() {
    db.query('SELECT * FROM departments', function(err, results){
        console.table(results);
        menu();
    });
};

//Adds an employee to the database
function addEmployee() {
    //we want to ask which role this employee has so we need to lookup the roles and save them so we can use the results to ask the user.
    db.query('SELECT * FROM roles', function(err, results){
        //create an array that will hold the current roles in the sql database and save the department id's that go along with them
        var roleDepartment = [];
        var roles = [];
        //loop through the results array and grab all the role names
        for(let i = 0; i < results.length; i++) {
            roleDepartment.push(results[i].department_id);
            roles.push(results[i].title);
        }
        //create a question using the returned roles
        const roleQuestion = {
            type: 'list',
            name: 'role',
            message: 'What is this employees role? ',
            choices: roles,
        }
        //push the question onto the other questions so we ask it in inquirer
        addEmployeeQuestions.push(roleQuestion);
        //now we still need the list of employees to ask which is a manager so lookup all the employees in the db
        db.query('SELECT * FROM employees', function(err, results){
            //create an array that will hold the current employees in the sql database
            var possibleManagers = ["None"];
            //loop through the results array and grab all the employee names
            for(let i = 0; i < results.length; i++) {
                possibleManagers.push(results[i].first_name + " " + results[i].last_name);
            }
            //create a question using the returned employees
            const managerQuestion = {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager? ",
                choices: possibleManagers,
            }
            //push the question onto the other questions so we ask it in inquirer
            addEmployeeQuestions.push(managerQuestion);
            //ask the user the questions
            inquirer
            .prompt(addEmployeeQuestions).then((answers) => {
                //save the department id using the list of roles and their corresponding department id that we saved before
                var departmentId = roleDepartment[roles.indexOf(answers.role)];
                //save the manager id, if there is no manager set it to null
                var managerId;
                if(answers.manager == 'None') {
                    managerId = null;
                }
                //if there is a manger then get the id of the manager based on the employees list we still have access to 
                else {
                    managerId = results[(possibleManagers.indexOf(answers.manager) - 1)].id;
                }
                //insert the employee into the db with the results we have saved
                db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)`, ([answers.firstName, answers.lastName, departmentId, managerId]), function(err, results){
                    console.log("Added " + answers.firstName + " " + answers.lastName + " into the database.")
                    addEmployeeQuestions.pop();
                    addEmployeeQuestions.pop();
                    menu();
                });
            });
        });
    });
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

//Updates the role info in the database
function updateEmployeeRole() {

}

//this function handles the menu for selecting what we want to do
function menu() {
    inquirer
    .prompt(menuQuestion).then((answers) => {
        switch (answers.next) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add Employees':
                addEmployee();
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