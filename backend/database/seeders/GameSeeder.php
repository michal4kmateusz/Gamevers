<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Category;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        $games = [
            [
                'title' => 'Space Shooter',
                'slug' => 'space-shooter',
                'description' => 'Kosmiczna gra akcji.',
                'short_description' => 'Przemierzaj kosmos.',
                'developer' => 'Gamevers Studio',
                'is_featured' => true,
                'is_active' => true,
                'categories' => ['akcja', 'przygodowe'],
            ],
            [
                'title' => 'Turbo Racing',
                'slug' => 'turbo-racing',
                'description' => 'Dynamiczna gra wyścigowa.',
                'short_description' => 'Rywalizuj na torze.',
                'developer' => 'Gamevers Studio',
                'is_featured' => true,
                'is_active' => true,
                'categories' => ['wyscigi', 'sportowe'],
            ],
            [
                'title' => 'Puzzle Master',
                'slug' => 'puzzle-master',
                'description' => 'Gra pełna zagadek logicznych.',
                'short_description' => 'Rozwiązuj łamigłówki.',
                'developer' => 'Gamevers Studio',
                'is_featured' => false,
                'is_active' => true,
                'categories' => ['logiczne'],
            ],
            [
                'title' => 'Fantasy World',
                'slug' => 'fantasy-world',
                'description' => 'Odkrywaj fantastyczny świat.',
                'short_description' => 'Rozpocznij przygodę.',
                'developer' => 'Gamevers Studio',
                'is_featured' => true,
                'is_active' => true,
                'categories' => ['rpg', 'przygodowe'],
            ],
            [
                'title' => 'City Builder',
                'slug' => 'city-builder',
                'description' => 'Buduj i rozwijaj własne miasto.',
                'short_description' => 'Zarządzaj swoim miastem.',
                'developer' => 'Gamevers Studio',
                'is_featured' => false,
                'is_active' => true,
                'categories' => ['strategiczne', 'symulacyjne'],
            ],
        ];

        foreach ($games as $gameData) {

            $categories = $gameData['categories'];

            unset($gameData['categories']);

            $game = Game::updateOrCreate(
                ['slug' => $gameData['slug']],
                $gameData
            );

            $categoryIds = Category::whereIn(
                'slug',
                $categories
            )->pluck('id');

            $game->categories()->sync($categoryIds);
        }
    }
}
