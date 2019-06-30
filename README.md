# Idiot's Delight

### A Simple Card Game for Simple People

### TO DO

##### LOGIC

- Create deck of cards
- Shuffle cards
- Deal four cards to the board, one to each card stack

###### Player Choice: choose DEAL or CLICK A CARD

###### DEAL

- If deck has four cards available, add them from left to right to card stacks
- If deck is empty (shouldn't happen) end game.

###### CLICK CARD

- Conditions

  - (1) More than one card stack is empty:
    - [ ][ ][x][x]
  - (2) One card stack is empty
    - [ ][x][x][x]
  - (3) All stacks are full
    - [x][x][x][x]

- Actions

  - (A) Click empty card stack [ ]
  - (B) Click filled card stack [x]

- Outcomes
  - (1A, 2A) Prompt player to choose a card to fill the chosen empty card stack
  - (3A) N/A
  - (1B, 2B, 3B) If card is beaten by superior card, remove it. If card cannot be beaten, notify player and do nothing

##### CLASSES AND OBJECTS

###### GAME

- Properties
  - Deck
  - Board
    - Card Stacks
      - Cards
- Methods
  - Builds Deck
  - Shuffles deck
  - Deals cards

###### BOARD
