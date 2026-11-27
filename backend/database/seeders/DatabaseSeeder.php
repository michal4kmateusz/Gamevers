<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            if (Game::exists() || Category::exists()) {
                $this->command->info(
                    'Katalog juz istnieje. Pomijam import.'
                );

                return;
            }

            $this->call([
                CategorySeeder::class,
                CatalogSeeder::class,
            ]);

            $this->command->info(
                'Baza Gamevers zostala przygotowana.'
            );
        });
    }
}
