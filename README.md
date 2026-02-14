# Space Runner

Un jeu de tir spatial (rail shooter, style Star Fox) jouable avec les mains via la webcam.

Le joueur controle un vaisseau qui avance automatiquement dans l'espace. Il doit detruire les asteroides en tirant dessus tout en les esquivant pour ne pas perdre de vies.

## Controles

| Action | Main | Clavier (fallback) |
|--------|------|---------------------|
| Deplacer le vaisseau | Main droite (position) | WASD / Fleches |
| Tirer | Main gauche (fermer le poing) | Espace |

## Fonctionnalites

- **Hand tracking** via MediaPipe (webcam) avec preview en temps reel des landmarks
- **Systeme de munitions** avec anneaux de recharge qui apparaissent quand les munitions sont basses
- **Radar / minimap** affichant les asteroides et la position du joueur
- **Explosions** avec particules instanciees
- **Niveaux progressifs** : les asteroides deviennent plus nombreux et plus rapides

## Stack technique

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (bundler)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + [drei](https://github.com/pmndrs/drei) (rendu 3D)
- [Three.js](https://threejs.org/) (moteur 3D)
- [Zustand](https://zustand-demo.pmnd.rs/) (state management)
- [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) (hand tracking)

## Installation

```bash
# Cloner le repo
git clone https://github.com/Para-FR/space-runner-youtube.git
cd space-runner-youtube

# Installer les dependances
npm install

# Lancer en mode dev
npm run dev
```

Le jeu sera accessible sur `http://localhost:5173/`. Le navigateur demandera l'acces a la webcam au lancement de la partie.

## Build

```bash
npm run build
npm run preview
```

## Assets 3D

Les modeles 3D (`.glb`) se trouvent dans `public/models/` :
- `spaceship.glb` : vaisseau du joueur
- `asteroids.glb` : asteroides
- `scifi_ring.glb` : anneaux decoratifs

Les anneaux de recharge de munitions sont generes proceduralement (torus geometry).
