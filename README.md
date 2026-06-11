# scene-motion-lab

Independent scene motion experiment bench for kitten nest scenes.

This repository is intentionally separate from the main kitten nest projects. It exists to test static images, CSS/web overlay motion, scene transitions, and image panning rules before any mature solution is moved back into the main nest.

## MVP

- Fixed-ratio image stage
- Per-scene IDs
- Panning modes: `static`, `pan-x`, `pan-y`, `pan-xy`
- Max movement bounds
- Transition presets
- CSS overlay effects
- Local temporary image import
- Exportable config JSON

## Boundary

This repo is a sandbox. It should not depend on or mutate the main kitten nest.

## Current test scenes

- `coffee_001_base`: coffee corner wide/environment scene
- `coffee_002_lap_closeup`: first-person lap closeup transition test
- `wide_window_test_001`: horizontal image panning test
- `rain_glass_test_001`: rain/fog/glass overlay test

## Recommended coffee corner transition

`coffee_001_base` → `coffee_002_lap_closeup`

Use `zoom-blur` plus a warm light mask to simulate walking closer and settling into the closeup scene.
