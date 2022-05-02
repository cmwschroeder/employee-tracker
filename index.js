const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

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

//question that will act as the menu of the program
const menuQuestion = [
    {
        type: 'list',
        name: 'next',
        message: 'Would you like to: ',
        choices: ['View All Employees', 'Add Employees', 'Update Employee Role', 'View all Roles', 'Add Role', 'View all Departments', 
                'Add Department', 'Update Employee Manager', 'View Employees By Manager', 'View Employees By Department', 'Quit'],
    }
];

//question for adding department
const addDepartmentQuestions = [
    {
        type: 'input',
        name: 'name',
        message: "Enter the name of the department: ",
    },
];

//questions for adding a role, will have a question added later
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

//questions for adding an employee, will have a question added later
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
];

//empty arry that will be used to ask questions to update an employees role, will hold 2 questions when used
const updateEmployeeRoleQuestions = [];

//This function shows all the employees in the db
function viewAllEmployees() {
    db.query('SELECT curr.id, curr.first_name, curr.last_name, role.title, dep.name AS department, role.salary, concat(man.first_name, " ", man.last_name) AS manager FROM employees curr JOIN roles role ON role.id = curr.role_id' + 
            ' JOIN departments dep ON role.department_id = dep.id LEFT JOIN employees man ON man.id = curr.manager_id ORDER BY id', function(err, results){
        console.table(results);
        menu();
    });
};

//This function shows all the roles in the db
function viewAllRoles() {
    db.query('SELECT roles.id, title, departments.name AS department, salary FROM roles JOIN departments ON roles.department_id = departments.id', function(err, results){
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
        var roleIds = [];
        var roles = [];
        //loop through the results array and grab all the role names
        for(let i = 0; i < results.length; i++) {
            roleIds.push(results[i].id);
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
                var roleId = roleIds[roles.indexOf(answers.role)];
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
                db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)`, ([answers.firstName, answers.lastName, roleId, managerId]), function(err, results){
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
    db.query('SELECT * FROM employees', function(err, results){
        //create an array that will hold the current employees in db along with an array that holds the ids
        var employeeIds = [];
        var employeeNames = [];
        //loop through the results array and grab all the employee names and their id's
        for(let i = 0; i < results.length; i++) {
            employeeIds.push(results[i].id);
            employeeNames.push(results[i].first_name + " " + results[i].last_name);
        }
        //create a question using the returned employees
        const employeeSelection = {
            type: 'list',
            name: 'name',
            message: "Which employee's role do you want to update?",
            choices: employeeNames,
        }
        //push the question onto the other questions so we ask it in inquirer
        updateEmployeeRoleQuestions.push(employeeSelection);
        //now we still need the list of roles to ask the user which we would like to switch to
        db.query('SELECT * FROM roles', function(err, results){
            //create an array that will hold the current roles in db
            var roles = [];
            //loop through the results array and grab all the role names
            for(let i = 0; i < results.length; i++) {
                roles.push(results[i].title);
            }
            //create a question using the returned roles
            const roleSelection = {
                type: 'list',
                name: 'role',
                message: "Which rolde do you want to assign the selected employee? ",
                choices: roles,
            }
            //push the question onto the other questions so we ask it in inquirer
            updateEmployeeRoleQuestions.push(roleSelection);
            //ask the user the questions
            inquirer
            .prompt(updateEmployeeRoleQuestions).then((answers) => {
                //get the id of the employee and the role selected so we can can update
                var roleId = results[roles.indexOf(answers.role)].id;
                var employeeId = employeeIds[employeeNames.indexOf(answers.name)];
                db.query(`UPDATE employees SET role_id = ? WHERE id = ?`, ([roleId, employeeId]), function(err, results){
                    console.log("Changed " + answers.name + "'s role.")
                    updateEmployeeRoleQuestions.pop();
                    updateEmployeeRoleQuestions.pop();
                    menu();
                });
            });
        });
    });
}

//This function allows the user to change the manager of an employee
function updateEmployeeManager() {
    db.query('SELECT * FROM employees', function(err, results){
        //create an array that will hold the current employees in db along with another list that will allow the user to set none
        //as the employee's new manager
        var employeeManager = ["None"]
        var employeeNames = [];
        //loop through the results array and grab all the employee names
        for(let i = 0; i < results.length; i++) {
            employeeNames.push(results[i].first_name + " " + results[i].last_name);
            employeeManager.push(results[i].first_name + " " + results[i].last_name);
        }
        //create questions using the returned employees
        const updateEmployeemManagerQuestions = [
            {
            type: 'list',
            name: 'name',
            message: "Which employee's manager do you want to update?",
            choices: employeeNames,
            },
            {
                type: 'list',
                name: 'manager',
                message: "Which employee is the manager of the employee you are updating?",
                choices: employeeManager,
            }
        ];
        //ask the questions to the user to determine who needs changing and who to put as the new manager of the selected employee
        inquirer
            .prompt(updateEmployeemManagerQuestions).then((answers) => {
                //get the id of the employee and the id of the manager
                var employeeId = results[employeeNames.indexOf(answers.name)].id;
                var managerId;
                //if the new manager is None then set manager id to null
                if(answers.manager == "None") {
                    managerId = null;
                } else {
                    managerId = results[employeeNames.indexOf(answers.manager)].id;
                }
                db.query(`UPDATE employees SET manager_id = ? WHERE id = ?`, ([managerId, employeeId]), function(err, results){
                    console.log("Changed " + answers.name + "'s manager.")
                    menu();
                });
            });
    });
}

//This function allows the user to view the employees based off of their manager
function viewEmployeesByManager() {
    db.query('SELECT * FROM employees', function(err, results){
        //create an array that will hold the current employees in db
        var employeeNames = [];
        //loop through the results array and grab all the employee names
        for(let i = 0; i < results.length; i++) {
            employeeNames.push(results[i].first_name + " " + results[i].last_name);
        }
        //create questions using the returned employees
        const findManagerQuestions = [
            {
                type: 'list',
                name: 'manager',
                message: "Which manager's employees would you like to view?",
                choices: employeeNames,
            }
        ];
        //ask the questions to the user to determine which manager's employees we are viewing
        inquirer
            .prompt(findManagerQuestions).then((answers) => {
                //get the id of the manager
                var managerId = results[employeeNames.indexOf(answers.manager)].id;
                db.query('SELECT curr.id, curr.first_name, curr.last_name, role.title, dep.name AS department, role.salary, concat(man.first_name, " ", man.last_name) AS manager FROM employees curr JOIN roles role ON role.id = curr.role_id' + 
                        ' JOIN departments dep ON role.department_id = dep.id JOIN employees man ON man.id = curr.manager_id WHERE curr.manager_id = ?', managerId, function(err, results){
                    console.table(results);
                    menu();
                });
            });
    });
}

//This function allows the user to view the employees of a chosen department
function viewEmployeesByDepartment() {
    db.query('SELECT * FROM departments', function(err, results){
        //create an array that will hold the current departments in db
        var departments = [];
        //loop through the results array and grab all the department names
        for(let i = 0; i < results.length; i++) {
            departments.push(results[i].name);
        }
        //create a question using the returned departments
        const findDepartmentQuestions = [
            {
                type: 'list',
                name: 'name',
                message: "Which department's employees would you like to view?",
                choices: departments,
            }
        ];
        //ask the questions to the user to determine which department's employees we are viewing
        inquirer
            .prompt(findDepartmentQuestions).then((answers) => {
                //get the id of the department
                var department_id = results[departments.indexOf(answers.name)].id;
                db.query('SELECT curr.id, curr.first_name, curr.last_name, role.title, dep.name AS department, role.salary, concat(man.first_name, " ", man.last_name) AS manager FROM employees curr JOIN roles role ON role.id = curr.role_id' + 
                        ' JOIN departments dep ON role.department_id = dep.id LEFT JOIN employees man ON man.id = curr.manager_id WHERE dep.id = ? ORDER BY curr.id', department_id, function(err, results){
                    console.table(results);
                    menu();
                });
            });
    });
}

//this function handles the menu for selecting what we want to do
function menu() {
    inquirer
    .prompt(menuQuestion).then((answers) => {
        //switch statement that will call the function that correlates with the option selected
        switch (answers.next) {
            case 'View All Employees':
                viewAllEmployees();
                break;
            case 'Add Employees':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
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
            case 'Update Employee Manager':
                updateEmployeeManager();
                break;
            case 'View Employees By Manager':
                viewEmployeesByManager();
                break;
            case 'View Employees By Department':
                viewEmployeesByDepartment();
                break;
            default:
                db.end();
                return;
        }
    });
}

menu();