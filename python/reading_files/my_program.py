
# Opens the file and looks up an acronym
def look_up_acronym():
    look_up = input("What software acronym would you like to look up? \n").upper() #changes input to uppercase

    found = False
    try:
        with open('acronyms.txt', 'r') as file: #opens the file in read mode
            # Do File Operations here
            for line in file:
                if look_up in line:
                    print(line)
                    found = True
                if not found:
                    print("Acronym not found.")
    except FileNotFoundError:
        print("Acronyms file not found.")
    


# Opens the file and adds an acronym
def add_acronym():
    acronym = input("What acronym would you like to add? \n").upper() #changes input to uppercase
    definition = input("What is the definition of the acronym? \n")

    with open('acronyms.txt', 'a') as file: #opens the file in append mode
            file.write(f"{acronym}: {definition}\n")

def remove_acronym():
    acronym = input("What acronym would you like to remove? \n").upper() #changes input to uppercase

    found = False
    with open('acronyms.txt', 'r') as file: #opens the file in read mode
        lines = file.readlines()
    with open('acronyms.txt', 'w') as file: #opens the file in write mode
        for line in lines:
            if line.startswith(acronym):
                found = True
            else:
                file.write(line)
    if found:
        print("Acronym removed.")
    else:
        print("Acronym not found.")

def main():
    choice = input("Would you like to look up an acronym, add an acronym, or remove an acronym? 1 = look up, 2 = add, 3 = remove \n")
    if choice == '1':
        look_up_acronym()
    elif choice == '2':
        add_acronym()
    elif choice == '3':
        remove_acronym()
    else:
        print("Invalid choice. Please enter 1, 2, or 3.")

main()