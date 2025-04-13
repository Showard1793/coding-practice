age = int(input("How old are you?\n"))
decades = str(int((age /10))) 
remainder = str(age % 10)

answer = "You are " + decades + " decades and " + remainder + " year(s) old." 

print(answer)

