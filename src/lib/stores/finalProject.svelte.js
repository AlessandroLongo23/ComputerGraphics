import { writable } from 'svelte/store';

export let modelOptions = writable([
    {
        value: 'sphere',
        label: 'Sphere',
    },
    {
        value: 'suzanne',
        label: 'Suzanne',
    },
    {
        value: 'teapot',
        label: 'Teapot',
    },
    {
        value: 'pumpkin',
        label: 'Pumpkin',
    },
    {
        value: 'marble_bust',
        label: 'Marble Bust',
    },
    {
        value: 'rubber_duck',
        label: 'Rubber Duck',
    },
    {
        value: 'watering_can',
        label: 'Watering Can',
    }
]);

export let texturePackOptions = writable([
    {
        value: 'bark_willow_02_2k',
        label: 'Bark Willow',
    },
    {
        value: 'blue_metal_plate_2k',
        label: 'Blue Metal Plate',
    },
    {
        value: 'brick_wall_04_2k',
        label: 'Brick Wall',
    },
    {
        value: 'concrete_wall_007_2k',
        label: 'Concrete Wall',
    },
    {
        value: 'corrugated_iron_2k',
        label: 'Corrugated Iron',
    },
    {
        value: 'denim_fabric_02_2k',
        label: 'Denim Fabric',
    },
    {
        value: 'fabric_leather_02_2k',
        label: 'Fabric Leather',
    },
    {
        value: 'fabric_pattern_07_2k',
        label: 'Fabric Pattern',
    },        
    {
        value: 'ganges_river_pebbles_2k',
        label: 'Ganges River Pebbles',
    },
    {
        value: 'gravel_stones_2k',
        label: 'Gravel Stones',
    },
    {
        value: 'gray_rocks_2k',
        label: 'Gray Rocks',
    },
    {
        value: 'herringbone_brick_2k',
        label: 'Herringbone Brick',
    },
    {
        value: 'metal_plate_2k',
        label: 'Metal Plate',
    },
    {
        value: 'metal_plate_02_2k',
        label: 'Metal Plate 2',
    },
    {
        value: 'mud_cracked_dry_riverbed_002_2k',
        label: 'Mud Cracked Dry Riverbed',
    },
    {
        value: 'oak_veneer_01_2k',
        label: 'Oak Veneer',
    },        
    {
        value: 'raw_plank_wall_2k',
        label: 'Raw Plank Wall',
    },
    {
        value: 'recycled_brick_floor_2k',
        label: 'Recycled Brick Floor',
    },
    {
        value: 'rock_embedded_concrete_wall_2k',
        label: 'Rock Embedded Concrete Wall',
    }
]);

export let cubemapOptions = writable([
    {
        value: 'autumn',
        label: 'Autumn',
    },
    {
        value: 'brightday',
        label: 'Bright Day',
    },
    {
        value: 'greenhill',
        label: 'Green Hill',
    },
    {
        value: 'nvidia',
        label: 'Nvidia',
    },
    {
        value: 'terrain',
        label: 'Terrain',
    }
]);