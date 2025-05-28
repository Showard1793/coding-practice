class Robot_Dog: 

    def __init__(self, name, breed):
        self.name = name             #properties  
        self.breed = breed
        
    def bark(self):                  #method
        print('Woof Woof!')

my_dog = Robot_Dog('Spot','Golden Doodle')

print(my_dog.name) #prints "Spot"

my_dog.bark()