acronyms = ["IMHO"]

#.append adds things to an array
acronyms.append("LOL")
acronyms.append("IDK")

print(acronyms)

#.remove removes the list item

acronyms.remove("LOL")

print(acronyms)

#check if item is in list

if "IDK" in acronyms:
    print("It's there!")

#looping through a list

for acronym in acronyms:
    print("This is one acronym: " + acronym)