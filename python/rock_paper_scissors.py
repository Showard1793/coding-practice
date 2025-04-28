import random

player_choice = int(input("What will you choose?\n 1)Rock\n 2)Paper\n 3)Scissor \n"))
opponent_choice = (random.choice(["Rock","Paper","Scissor"]))

#Player chooses Rock
if player_choice == 1 and opponent_choice == "Scissor":
    print("Computer chose " + opponent_choice + ". Rock beats Scissor, you win!")
if player_choice == 1 and opponent_choice == "Rock":
    print("Computer chose " + opponent_choice + ". Tie")
if player_choice == 1 and opponent_choice == "Paper":
    print("Computer chose " + opponent_choice + ". Paper beats Rock, you lose!")

#Player chooses Paper
if player_choice == 2 and opponent_choice == "Scissor":
    print("Computer chose " + opponent_choice + ". Scissor beats Paper, you lose!")
if player_choice == 2 and opponent_choice == "Rock":
    print("Computer chose " + opponent_choice + ". Paper beats Rock, you win!")
if player_choice == 2 and opponent_choice == "Paper":
    print("Computer chose " + opponent_choice + ". Tie")

#Player chooses Scissor
if player_choice == 3 and opponent_choice == "Scissor":
    print("Computer chose " + opponent_choice + ". Tie")
if player_choice == 3 and opponent_choice == "Rock":
    print("Computer chose " + opponent_choice + ". Rock beats Scissor, you lose!")
if player_choice == 3 and opponent_choice == "Paper":
    print("Computer chose " + opponent_choice + ". Scissor beats Paper, you win!")

