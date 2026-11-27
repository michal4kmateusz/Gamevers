<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $games = json_decode(
            file_get_contents(
                database_path('data/games.json')
            ),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        DB::transaction(function () use ($games) {

            foreach ($games as $item) {

                $game = Game::firstOrNew([
                    'slug' => $item['slug']
                ]);

                $game->forceFill([
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
            }

            Game::whereIn('slug', [
                'space-shooter',
                'turbo-racing',
                'puzzle-master',
                'fantasy-world',
                'city-builder'
            ])->update([
                'is_active' => false
            ]);
        });

        $this->command->info(
            'Zaimportowano katalog: '
            . count($games)
            . ' gier.'
        );
    }
}

