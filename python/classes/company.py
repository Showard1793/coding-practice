from employee import Employee

class Company: 
    def __init__(self):
        self.employees = []
        self.team1 = []
        self.team2 = []
        self.team3 = []

    def company_function(self):
        make_another_choice = 1
        while make_another_choice == 1:
            print("\n")
            choice = int(input("What company function would you like to perform? \n \nAdd Employee = 1 \nFire Employee = 2 \nList Employees = 3\nAdd Employee to Team = 4\nPay Employee = 5\nExit = 6\n\n"))
            if choice == 1:
                self.add_employee()
            if choice == 2:
                self.fire_employee()
            if choice == 3:
                self.list_employees()
            if choice == 4:
                self.add_to_team()
            if choice == 5:
                self.pay_employees()
            if choice == 6:
                make_another_choice = 0
                return 
            if choice < 1 or choice > 6:
                make_another_choice = 1

    def add_employee(self):
        add_more = 1
        while add_more == 1:
            employee_fname = input("First name? \n")
            employee_lname = input("Last name? \n")
            employee_salary = float(input("Annual salary? \n"))
            new_employee = Employee(employee_fname, employee_lname, employee_salary)
            self.employees.append(new_employee)
            print('-------------------------')
            print(employee_fname,employee_lname + " has been added to the employee list")
            print('-------------------------')
            add_more = int(input("Would you like to add another? (no = 0, yes = 1) \n"))

    def fire_employee(self):
        fire_more = 1
        print('-------------------------')
        while fire_more == 1:
            employee_fname = input("First name? \n")
            employee_lname = input("Last name? \n")
            for employee in self.employees:
                if employee.fname == employee_fname and employee.lname == employee_lname:
                    self.employees.remove(employee)
                    print(f"{employee_fname} {employee_lname} has been fired.\n")
                    print('-------------------------')
                    fire_more = int(input("Would you like to fire another employee? (no = 0, yes = 1) \n"))
            print('-------------------------')
            print(f"{employee_fname} {employee_lname} not found.")
            print('-------------------------')



    def list_employees(self):
        print('-------------------------')
        print("Current Employees: \n")
        for i in self.employees:
            print(i.fname, i.lname + " // Annual Salary: " + str(f"Amount:, ${i.salary:,.2f}"))
            print('-------------------------')

    def add_to_team(self):
       add_more = 1
       while add_more == 1:
            print('-------------------------')
            print("Who would you like to add an employee to a team? \n")
            fname_to_be_added = input("First name? \n")
            lname_to_be_added = input("Last name? \n")
            team_number = input("Which team (1, 2, or 3)? \n")

            for employee in self.employees: 
                if employee.fname == fname_to_be_added and employee.lname == lname_to_be_added:
                    getattr(self, "team" + team_number).append(employee)
                    print('-------------------------')
                    print(f"{fname_to_be_added} {lname_to_be_added} added to Team {team_number}.\n")
                    print('-------------------------')
                    return
                
            print(f"{fname_to_be_added} {lname_to_be_added} not found among employees.\n")
            add_more = int(input("Would you like to add another? (no = 0, yes = 1) \n"))

    
    def pay_employees(self):
        print('-------------------------')
        print("Paying Employees:")
        for i in self.employees:
            print('Paycheck for:', i.fname, i.lname)
            print(f"Amount:, ${i.calculate_paycheck():,.2f}")   #Formats the floats so there are "," for thousands and floats are rounded to 2 decimal places
            print("-------------------------------")

def main():
    my_company = Company()

    my_company.company_function()


    
main()
