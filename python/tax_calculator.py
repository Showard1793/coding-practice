#input returns a string. need to change it to int
amount = int(input("What is the price of your item? "))
tax = 0.06

#need to change it back to string
total = str(amount + amount*tax)

print("Your total is"+ " $" + total)



