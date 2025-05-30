from employee import Employee

class Company: 
    def __init__(self):
        self.employees = []
        self.team1 = []
        self.team2 = []
        self.team3 = []

    def add_employee(self, new_employee):
        self.employees.append(new_employee)

    def fire_employee(self, first_name, last_name):
        for employee in self.employees:
            if employee.fname == first_name and employee.lname == last_name:
                self.employees.remove(employee)
                print(f"{first_name} {last_name} has been fired.\n")
                return
        print(f"{first_name} {last_name} not found.\n")

    def list_employees(self):
        print("Current Employees: \n")
        for i in self.employees:
            print(i.fname, i.lname)
        print('-------------------------')

    def add_to_team(self):
       print("Who would you like to add to a team? \n")
       fname_to_be_added = input("First name? \n")
       lname_to_be_added = input("Last name? \n")
       team_number = input("Which team (1, 2, or 3)? \n")

       for employee in self.employees: 
           if employee.fname == fname_to_be_added and employee.lname == lname_to_be_added:
               getattr(self, "team" + team_number).append(employee)
               print(f"{fname_to_be_added} {lname_to_be_added} added to Team {team_number}.\n")
               return
    
    def pay_employees(self):
        print("Paying Employees:")
        for i in self.employees:
            print('Paycheck for:', i.fname, i.lname)
            print(f"Amount:, ${i.calculate_paycheck():,.2f}")   #Formats the floats so there are "," for thousands and floats are rounded to 2 decimal places
            print("-------------------------------")

def main():
    my_company = Company()

    employee1 = Employee("Sarah","Jones",40000)
    my_company.add_employee(employee1)

    employee2 = Employee("Bob","Jones",60000)
    my_company.add_employee(employee2)

    employee3 = Employee("Mark","Jones",70000)
    my_company.add_employee(employee3)

    my_company.list_employees()
    my_company.fire_employee("Bob","Jones")
    my_company.list_employees()

    my_company.pay_employees()

    my_company.add_to_team()

    
main()
