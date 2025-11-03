from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# Moves used in combos separated into categories
head_punches = ["lead jab", "rear cross", "lead hook", "rear hook", "lead uppercut", "rear uppercut", "rear overhand"]
body_punches = ["lead body jab", "rear body cross", "lead body hook", "rear body hook"]
body_hooks = ["lead body hook", "rear body hook"]
defensive_moves = ["lead slip", "rear slip", "lead roll", "rear roll"]
slips = ["lead slip", "rear slip"]
rolls = ["lead roll", "rear roll"]
starter_moves = ["lead jab", "rear cross", "lead hook"]

# functions to identify which moves are being used
def is_lead(move): return move.startswith("lead")
def is_rear(move): return move.startswith("rear")
def is_body(move): return move in body_punches
def is_defensive(move): return move in defensive_moves
def is_punch(move): return move in head_punches + body_punches

def can_add_move(combo, move, body_punch_used, target_length):

    #  Overhands can only be thrown as the last punch in a combination
    if move == "rear overhand":
        if len(combo) + 1 != target_length:
            return False

    # Only one body punch per combo as too many can leave you open to counters
    if is_body(move) and body_punch_used:
        return False

    # 3 lead strikes in a row max
    if len(combo) >= 3:
        last_three = combo[-3:]
        if all(is_lead(m) for m in last_three) and is_lead(move):
            return False

    #3rd lead strike cant be uppercut
    if len(combo) >= 2:
        last_two = combo[-2:]
        if all(is_lead(m) for m in last_two) and is_lead(move) and "uppercut" in move:
            return False

    # 2 rear strikes in a row max
    if len(combo) >= 2:
        last_two = combo[-2:]
        if all(is_rear(m) for m in last_two) and is_rear(move):
            return False

    if len(combo) >= 2 and combo[-1] == move and combo[-2] == move:
        return False

    if combo and is_defensive(combo[-1]) and is_defensive(move):
        return False

    if combo:
        prev = combo[-1]

        #if prev in body_hooks and move in slips:
            #return False

        if prev in slips and is_punch(move):
            # Only allow same-side body hooks after slips
            if move not in body_hooks + head_punches:
                return False
            if is_lead(prev) and not is_lead(move):
                return False
            if is_rear(prev) and not is_rear(move):
                return False

        elif prev in rolls and is_punch(move):
            # After rolls, only allow same-side head punches
            if move not in head_punches:
                return False
            if is_lead(prev) and not is_lead(move):
                return False
            if is_rear(prev) and not is_rear(move):
                return False

        #Rules for consecutive punches
        if move in ["rear hook", "rear overhand", "rear uppercut", "lead uppercut"] and move == prev:
            return False
        if (prev == "rear hook" and move == "rear overhand") or (prev == "rear overhand" and move == "rear hook"):
            return False
        if (prev == "rear uppercut" and move == "rear overhand") or (prev == "rear overhand" and move == "rear uppercut"):
            return False
        if (prev == "rear hook" and move == "rear cross") or (prev == "rear cross" and move == "rear hook"):
            return False
        if (prev == "rear body hook" and move == "rear cross") or (prev == "rear cross" and move == "rear body hook"):
            return False
        if (prev == "rear cross" and move == "rear uppercut") or (prev == "rear uppercut" and move == "rear cross"):
            return False
        if (prev == "rear hook" and move == "rear body cross") or (prev == "rear body cross" and move == "rear hook"):
            return False
        if (prev == "rear cross" and move == "rear cross"):
            return False

        # Only allow defensive moves and offensive moves to be done consecutively from the same side
        if is_defensive(prev) and is_punch(move):
            if is_lead(prev) and is_rear(move):
                return False
            if is_rear(prev) and is_lead(move):
                return False

        if is_punch(prev) and is_defensive(move):
            if is_lead(prev) and is_rear(move):
                return False
            if is_rear(prev) and is_lead(move):
                return False

        # Ban uppercuts after rolls
        if prev in ["lead roll", "rear roll"] and move in ["lead uppercut", "rear uppercut"]:
            return False
        # Rear overhands can only be thrown after jab or body jab
        if move == "rear overhand":
            if prev not in ["lead jab", "lead body jab"]:
                return False
        if move == "lead body jab":
            if prev not in ["lead jab"]:
                return False
        if prev == "rear cross":
            if move not in ["lead jab", "lead hook", "lead uppercut", "lead body hook", "rear roll"]:
                return False
        if prev == "rear body cross":
            if move not in ["lead jab", "lead hook", "lead uppercut"]:
                return False

    return True

# Had help from ChatGPT writing the generate_combination function
def generate_combination(min_length=3):
    while True:
        combination = [random.choice(starter_moves)]
        body_punch_used = is_body(combination[0])
        target_length = random.randint(min_length, 5)

        all_moves = head_punches + body_punches + defensive_moves

        while len(combination) < target_length:
            random.shuffle(all_moves)
            for move in all_moves:
                if can_add_move(combination, move, body_punch_used, target_length):
                    combination.append(move)
                    if is_body(move):
                        body_punch_used = True
                    break
            else:
                break

        # Remove body punches and defensive moves from the end of a combination.
        while len(combination) > 1 and (is_defensive(combination[-1]) or is_body(combination[-1])):
            combination.pop()

        if len(combination) >= min_length:
            return combination

# Routes

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/combo")
def combo():
    return jsonify(generate_combination())

if __name__ == "__main__":
    app.run(debug=True)
