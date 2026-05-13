/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const TILE_SIZE = 20;

export const GRID_WIDTH = CANVAS_WIDTH / TILE_SIZE;
export const GRID_HEIGHT = CANVAS_HEIGHT / TILE_SIZE;

export const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export const INITIAL_DIRECTION = "RIGHT";

export const BASE_SPEED = 100; // ms per move
export const MIN_SPEED = 40;
export const SPEED_INCREMENT = 1;

export const COLORS = {
  BACKGROUND: "#000000",
  PANEL: "#0f172a",
  OUTER: "#020617",
  GRID: "#1e293b",
  SNAKE_HEAD: "#4ade80",
  SNAKE_BODY: "#22c55e",
  FOOD: "#ef4444",
  TEXT_PRIMARY: "#f1f5f9",
  TEXT_SECONDARY: "#64748b",
  ACCENT: "#22c55e",
  BORDER: "#1e293b",
};
