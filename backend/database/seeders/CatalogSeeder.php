<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('data/games.json');

        if (!is_readable($path)) {
            throw new RuntimeException(
                'Nie znaleziono pliku games.json.'
            );
        }

        $games = json_decode(
            file_get_contents($path),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        if (!is_array($games) || empty($games)) {
            throw new RuntimeException(
                'Katalog gier jest pusty lub nieprawidlowy.'
            );
        }

        $imported = 0;

        DB::transaction(function () use ($games, &$imported) {

            foreach ($games as $item) {

                if (Game::where('slug', $item['slug'])->exists()) {
                    continue;
                }

                $game = new Game();

                $game->forceFill([
                    'slug' => $item['slug'],
                    'title' => $item['title'],
                    'description' => $item['description'],

                    'short_description' => Str::limit(
                        $item['description'], 150
                    ),

                    'steam_id' => $item['steam_id'],
                    'developer' => $item['developer'],
                    'publisher' => $item['publisher'],

                    'release_date' => $item['release_date'],

                    'thumbnail' => $item['cover_url'],
                    'banner' => $item['banner_url'],
                    'poster_url' => $item['poster_url'],

                    'platforms' => json_encode(
                        $item['platforms']
                    ),

                    'demo_rating' => $item['rating'],

                    'is_featured' => $item['featured'],
                    'is_popular' => $item['popular'],
                    'is_active' => true,

                    'game_url' =>
                        'https://store.steampowered.com/app/'
                        . $item['steam_id'] . '/',
                ]);

                $game->save();

                $categoryIds = [];

                foreach ($item['genres'] as $genre) {

                    $category = Category::firstOrCreate(
                        ['slug' => Str::slug($genre)],
                        ['name' => $genre]
                    );

                    $categoryIds[] = $category->id;
                }

                $game->categories()->sync($categoryIds);

                $imported++;
            }
        });

        $this->command->info(
            'Zaimportowano nowych gier: ' . $imported
        );
    }
}
