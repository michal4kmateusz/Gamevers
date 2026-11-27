<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Akcja',
                'slug' => 'akcja',
                'description' => 'Dynamiczne gry akcji.',
            ],
            [
                'name' => 'Przygodowe',
                'slug' => 'przygodowe',
                'description' => 'Gry pełne przygód i eksploracji.',
            ],
            [
                'name' => 'Wyścigi',
                'slug' => 'wyscigi',
                'description' => 'Gry samochodowe i wyścigowe.',
            ],
            [
                'name' => 'Strategiczne',
                'slug' => 'strategiczne',
                'description' => 'Gry wymagające planowania.',
            ],
            [
                'name' => 'RPG',
                'slug' => 'rpg',
                'description' => 'Gry fabularne i rozwój postaci.',
            ],
            [
                'name' => 'Sportowe',
                'slug' => 'sportowe',
                'description' => 'Gry o tematyce sportowej.',
            ],
            [
                'name' => 'Logiczne',
                'slug' => 'logiczne',
                'description' => 'Gry logiczne i łamigłówki.',
            ],
            [
                'name' => 'Symulacyjne',
                'slug' => 'symulacyjne',
                'description' => 'Gry symulujące różne aktywności.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
