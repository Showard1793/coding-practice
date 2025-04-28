numbers = [10.5, 8, 5, 15, 20, 5, 3]

number= 0 

for expense in numbers: 
    number = number + expense

# sep= is how you choose what is between each argument 
print("You spent $", number, sep = "")


#prints 0 -6
for i in range(7):
    print(i)

#range(start, stop, step)  ----- 2 to 12 counting by 2s
for i in range(2,14,2):
    print(i)



#EXPENSE LOOP
total = 0
expenses = []
for i in range(7):
    expenses.append(float(input("Enter an expense: ")))

print(expenses)

total = sum(expenses)

print("You spent $", total, sep="")