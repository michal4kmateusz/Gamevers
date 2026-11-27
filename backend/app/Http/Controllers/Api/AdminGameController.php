<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminGameController extends Controller
{
    // POBIERANIE LISTY GIER

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,inactive',
            'featured' => 'nullable|boolean',
            'category' => 'nullable|integer|exists:categories,id',
            'sort' => 'nullable|in:newest,oldest,name,name_desc,popular,rating',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Game::with('categories')
            ->withCount(['reviews', 'favorites'])
            ->withAvg('reviews as average_rating', 'rating');

        // Wyszukiwanie

        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('developer', 'like', "%{$search}%")
                    ->orWhere('publisher', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Status gry

        if ($request->filled('status')) {
            $query->where(
                'is_active',
                $request->input('status') === 'active'
            );
        }

        // Gry wyroznione

        if ($request->filled('featured')) {
            $query->where(
                'is_featured',
                $request->boolean('featured')
            );
        }

        // Kategorie

        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where(
                    'categories.id',
                    $request->integer('category')
                );
            });
        }

        // Sortowanie

        switch ($request->input('sort', 'newest')) {
            case 'oldest':
                $query->orderBy('created_at');
                break;

            case 'name':
                $query->orderBy('title');
                break;

            case 'name_desc':
                $query->orderByDesc('title');
                break;

            case 'popular':
                $query->orderByDesc('views');
                break;

            case 'rating':
                $query->orderByDesc('average_rating');
                break;

            default:
                $query->orderByDesc('created_at');
                break;
        }

        $query->orderByDesc('id');

        return response()->json(
            $query->paginate(
                $request->integer('per_page', 10)
            )->withQueryString()
        );
    }

    // STATYSTYKI KATALOGU

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_games' => Game::count(),

            'active_games' => Game::where(
                'is_active', true
            )->count(),

            'inactive_games' => Game::where(
                'is_active', false
            )->count(),

            'featured_games' => Game::where(
                'is_featured', true
            )->where('is_active', true)->count(),

            'popular_games' => Game::where(
                'is_popular', true
            )->where('is_active', true)->count(),
        ]);
    }

    // SZCZEGOLY GRY

    public function show(int $gameId): JsonResponse
    {
        $game = Game::with('categories')
            ->withCount(['reviews', 'favorites'])
            ->withAvg('reviews as average_rating', 'rating')
            ->findOrFail($gameId);

        return response()->json($game);
    }

    // DODAWANIE GRY

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(
            $this->gameRules()
        );

        $categoryIds = $validated['category_ids'] ?? [];

        unset($validated['category_ids']);

        if (array_key_exists('platforms', $validated)) {
            $validated['platforms'] = json_encode(
                $validated['platforms'] ?? [],
                JSON_THROW_ON_ERROR
            );
        }

        $validated['is_active'] =
            $validated['is_active'] ?? true;

        $validated['is_featured'] =
            $validated['is_featured'] ?? false;

        $validated['is_popular'] =
            $validated['is_popular'] ?? false;

        $game = DB::transaction(function () use (
            $validated,
            $categoryIds
        ) {
            $game = Game::create($validated);

            $game->categories()->sync($categoryIds);

            return $game;
        });

        return response()->json([
            'message' => 'Gra została dodana.',
            'game' => $game->fresh()->load('categories'),
        ], 201);
    }

    // EDYTOWANIE GRY

    public function update(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $game = Game::findOrFail($gameId);

        $validated = $request->validate(
            $this->gameRules($game)
        );

        $categoryIds = $validated['category_ids'] ?? null;

        unset($validated['category_ids']);

        if (array_key_exists('platforms', $validated)) {
            $validated['platforms'] = json_encode(
                $validated['platforms'] ?? [],
                JSON_THROW_ON_ERROR
            );
        }

        DB::transaction(function () use (
            $game,
            $validated,
            $categoryIds
        ) {
            $game->update($validated);

            if ($categoryIds !== null) {
                $game->categories()->sync($categoryIds);
            }
        });

        return response()->json([
            'message' => 'Gra została zaktualizowana.',
            'game' => $game->fresh()->load('categories'),
        ]);
    }

    // AKTYWACJA I DEZAKTYWACJA

    public function updateStatus(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $game = Game::findOrFail($gameId);

        $game->update([
            'is_active' => $validated['is_active'],
        ]);

        return response()->json([
            'message' => $game->is_active
                ? 'Gra została aktywowana.'
                : 'Gra została dezaktywowana.',

            'game' => $game->fresh()->load('categories'),
        ]);
    }

    // REGULY WALIDACJI

    private function gameRules(?Game $game = null): array
    {
        $slugRule = Rule::unique('games', 'slug');

        if ($game !== null) {
            $slugRule->ignore($game->id);
        }

        $required = $game === null
            ? 'required'
            : 'sometimes|required';

        $mediaRules = [
            'nullable',
            'string',
            'max:255',
            'regex:~^(https?://[^\s]+|/(?!/)[^\s]+)$~i',
        ];

        return [
            'title' => [
                $required,
                'string',
                'max:255',
            ],

            'slug' => [
                $required,
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                $slugRule,
            ],

            'description' => [
                $required,
                'string',
                'max:20000',
            ],

            'short_description' => 'nullable|string|max:500',

            'thumbnail' => $mediaRules,
            'banner' => $mediaRules,
            'poster_url' => $mediaRules,
            'gif_url' => $mediaRules,

            'game_url' => 'nullable|url:http,https|max:2048',

            'developer' => 'nullable|string|max:255',

            'publisher' => 'nullable|string|max:255',

            'release_date' => 'nullable|date_format:Y-m-d',

            'steam_id' => 'nullable|integer|min:1',

            'platforms' => 'nullable|array|max:20',

            'platforms.*' => 'required|string|max:100|distinct',

            'is_featured' => 'sometimes|boolean',

            'is_popular' => 'sometimes|boolean',

            'is_active' => 'sometimes|boolean',

            'category_ids' => 'sometimes|array|max:100',

            'category_ids.*' => [
                'required',
                'integer',
                'distinct',
                'exists:categories,id',
            ],
        ];
    }
}

