#How to create a dictionary 

movie_schedule = {
    "The Outsiders": "9am , 12am",
    "West Side Story": "7pm"
}

print(movie_schedule["West Side Story"])

print(movie_schedule)


Character = {
    "Age" : int(input("How old are you? ")),
    "Class" : input("What class are you in?")
}

print(Character.values())

if 10 in Character.values():
    print("This character is 10!")