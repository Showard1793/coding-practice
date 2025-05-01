
amount_borrowed = float(input("How much money did you borrow? \n"))
annual_rate = float(input("What is the annual rate? \n"))
monthly_payment = float(input("How much will you be paying each month?\n"))

monthly_rate = annual_rate/100/12

monthly_principle_paid = monthly_payment - (amount_borrowed * monthly_rate) 

payoff_time = amount_borrowed / monthly_principle_paid

if payoff_time > 12:
    payoff_time = payoff_time /12

    print("It will take you", payoff_time, "years to pay off your loan")

else: 
    print("It will take you", payoff_time, "months to pay off your loan")

