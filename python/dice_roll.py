import random

player1 = input("Enter Player 1's name:\n")
player2 = input("Enter Player 2's name:\n")



def roll_dice():
    return random.randint(1,6)


def play():
    player1roll = roll_dice()
    player2roll = roll_dice()
    print(player1, "rolled a",str(player1roll)+",", "and",player2,"rolled a",player2roll)
    if player1roll == player2roll:
        print("It's a tie!")
    elif player1roll > player2roll:
        print(player1,"wins!")
    else:
        print(player2,"wins!")

play()

# options = ["cat","dog","snake"]

# print(random.choice(options))

