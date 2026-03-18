import { z } from 'zod'

// Settings schema
export const settingsSchema = z.object({
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
  maxPlayers: z.number().min(1).max(100).default(10),
  timeLimit: z.number().min(0).default(300),
  friendlyFire: z.boolean().default(false),
  respawnTime: z.number().min(0).default(5),
})

// Weapon schema
export const weaponSchema = z.object({
  name: z.string().min(1),
  damage: z.number().min(0).max(1000).default(50),
  fireRate: z.number().min(0).default(1),
  recoil: z.number().min(0).max(1).default(0.1),
  ammoCapacity: z.number().min(0).default(30),
  reloadTime: z.number().min(0).default(2),
})

// Character schema
export const characterSchema = z.object({
  name: z.string().min(1),
  health: z.number().min(1).default(100),
  speed: z.number().min(0).default(10),
  jumpHeight: z.number().min(0).default(5),
  armor: z.number().min(0).default(0),
})

// Map schema
export const mapSchema = z.object({
  name: z.string().min(1),
  size: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
  }).default({ width: 100, height: 100 }),
  gravity: z.number().min(0).default(9.8),
  lighting: z.enum(['day', 'night', 'dusk']).default('day'),
})

// Script schema
export const scriptSchema = z.object({
  name: z.string().min(1),
  content: z.string(),
})

// Texture schema
export const textureSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
})

// AI response schema for structured changes
export const aiResponseSchema = z.object({
  type: z.enum(['settings', 'weapons', 'characters', 'maps', 'scripts']),
  changes: z.array(z.object({
    field: z.string(),
    value: z.any(),
    description: z.string().optional(),
  })),
})

// Union of all schemas
export const modSchemas = {
  settings: settingsSchema,
  weapons: weaponSchema,
  characters: characterSchema,
  maps: mapSchema,
  scripts: scriptSchema,
  textures: textureSchema,
}