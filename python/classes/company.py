from employee import Employee

class Company: 
    def __init__(self):
        self.employees = []

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

    
main()
