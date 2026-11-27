<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GameController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'featured' => 'nullable|boolean',
            'sort' => 'nullable|in:newest,oldest,popular,name,name_desc,rating',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Game::with('categories')
            ->withCount('reviews')
            ->withAvg('reviews as average_rating', 'rating')
            ->where('is_active', true);

        // Wyszukiwanie
        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('developer', 'like', "%{$search}%")
                  ->orWhereHas('categories', function ($category) use ($search) {
                      $category->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtrowanie kategorii
        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->input('category'));
            });
        }

        // Gry wyroznione
        if ($request->filled('featured')) {
            $query->where(
                'is_featured',
                $request->boolean('featured')
            );
        }

        // Sortowanie
        switch ($request->input('sort', 'newest')) {
            case 'popular':
                $query->orderByDesc('views');
                break;

            case 'rating':
                $query->orderByDesc('average_rating')
                      ->orderByDesc('reviews_count');
                break;

            case 'name':
                $query->orderBy('title');
                break;

            case 'name_desc':
                $query->orderByDesc('title');
                break;

            case 'oldest':
                $query->orderByRaw('release_date IS NULL')
                      ->orderBy('release_date');
                break;

            default:
                $query->orderByRaw('release_date IS NULL')
                      ->orderByDesc('release_date');
                break;
        }

        $query->orderBy('id');

        // Paginacja
        $games = $query->paginate(
            $request->integer('per_page', 12)
        )->withQueryString();

        return response()->json($games);
    }

    public function show(string $slug): JsonResponse
    {
        $game = Game::with('categories')
            ->withCount('reviews')
            ->withAvg('reviews as average_rating', 'rating')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($game);
    }
}

