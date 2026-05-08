# SPLIT // AURA-GRID

A high-stakes, combinatorial strategy game set in a futuristic neural-link environment. Navigate the grid, partition your processing power, and dominate the opponent through precise mathematical allocation.

## 🔗 The Core Concept

SPLIT is a tactical race across six parallel data lanes. Players must take a single numeric input (the "Roll") and split its value across different lanes to advance their markers. The game is won not just by luck, but by how efficiently you divide your resources and how aggressively you disrupt your opponent.

## 🕹️ System Protocols (How to Play)

1.  **Initialize**: Choose your character class (**TITAN**, **WRAITH**, or **PRISM**) and synchronize your neural link.
2.  **The Roll**: On your turn, a value from 1 to 6 is generated.
3.  **The Partition**: You must split this value into parts that sum up exactly to the total roll. 
    - Each lane has a specific **Activation Value** (L1, L2, L3, L4, L5, L6).
    - To move in a lane, you must allocate its value from your roll.
    - *Example*: If you roll a 6, you could move L6 once, or L1 six times, or L4 once plus L2 once.
4.  **Neural Interference (Bumping)**: If your marker lands on the *exact same position* as your opponent's marker in a lane, their marker is **PURGED** and reset to position 0.
5.  **Synchronization (Winning)**: The first player to fully synchronize (reach the final step) in **any 3 lanes** secures victory and shuts down the grid.

### Lane Architecture
| Lane | Value (Cost) | Max Steps |
| :--- | :--- | :--- |
| **L1** | 1 | 10 |
| **L2** | 2 | 6 |
| **L3** | 3 | 4 |
| **L4** | 4 | 3 |
| **L5** | 5 | 3 |
| **L6** | 6 | 2 |

## 🛠️ Technological Stack

-   **Frontend**: React 18 + Vite
-   **Styling**: Tailwind CSS (Neo-Noir / Cyberpunk aesthetic)
-   **Animation**: Motion (Framer Motion) for fluid state transitions.
-   **State Management**: Zustand (Engine Logic)
-   **Neural Commentary**: Integrated Gemini-3 Flash Engine for real-time cynical AI commentary.

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- npm / yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 🖥️ User Interface Features

-   **Process Logs**: Real-time event stream tracking every move and system event.
-   **Combinatorial Controller**: Interactive interface for calculating and executing valid splits.
-   **Synesthetic HUD**: Visual feedback system using glow effects and chromatic aberration to signify grid stability.
-   **Neural Link**: Integrated match-making with the **EXO_ECHO** AI opponent.

---
**TERMINAL ACCESS GRANTED. GOOD LUCK ON THE GRID.**
