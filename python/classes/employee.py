class Employee: 
    def __init__(self, fname,lname,salary):
        self.fname = fname
        self.lname = lname
        self.salary = salary
    
    def quit(self):
        print("I quit!")

    def calculate_paycheck(self):
        return self.salary/52
    
    

employee1 = Employee("Tom","Bearman",50000)

print(employee1.calculate_paycheck())