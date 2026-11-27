
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->unsignedBigInteger('steam_id')->nullable();
            $table->string('publisher')->nullable();
            $table->json('platforms')->nullable();
            $table->string('poster_url')->nullable();
            $table->string('gif_url')->nullable();
            $table->decimal('demo_rating', 3, 1)->nullable();
            $table->boolean('is_popular')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn([
                'steam_id',
                'publisher',
                'platforms',
                'poster_url',
                'gif_url',
                'demo_rating',
                'is_popular'
            ]);
        });
    }
};

