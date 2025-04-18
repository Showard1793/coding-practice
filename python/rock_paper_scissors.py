import random

choice = ["Rock","Paper","Scissor"]

player_choice = int(input("What will you choose?\n 1)Rock\n 2)Paper\n 3)Scissor"))
opponent_choice = (random.choice(choice))

#Player chooses Rock
if player_choice == 1 and opponent_choice == "Scissor":
    print("Rock beats Scissor, you win!")
if player_choice == 1 and opponent_choice == "Rock":
    print("Tie")
if player_choice == 1 and opponent_choice == "Paper":
    print("Paper beats Rock, you lose!")

#Player chooses Paper