<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'thumbnail',
        'banner',
        'game_url',
        'developer',
        'release_date',
        'views',
        'is_featured',
        'is_active',
        'steam_id',
        'publisher',
        'platforms',
        'poster_url',
        'gif_url',
        'is_popular',
    ];

    protected $casts = [
        'release_date' => 'date:Y-m-d',
        'views' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'steam_id' => 'integer',
        'demo_rating' => 'float',
    ];

    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'category_game'
        );
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(
            User::class,
            'favorites',
            'game_id',
            'user_id'
        )->withTimestamps();
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

