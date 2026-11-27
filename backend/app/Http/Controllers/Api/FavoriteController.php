<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()
            ->favorites()
            ->whereHas('game', function ($query) {
                $query->where('is_active', true);
            })
            ->with('game.categories')
            ->latest()
            ->get();

        return response()->json($favorites);
    }

    public function store(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:wishlist,playing,completed,dropped',
        ]);

        $game = Game::where('is_active', true)
            ->findOrFail($gameId);

        $favorite = $request->user()
            ->favorites()
            ->firstOrCreate(
                ['game_id' => $game->id],
                [
                    'status' => $validated['status']
                        ?? 'wishlist'
                ]
            );

        return response()->json([
            'message' => 'Gra znajduje się w bibliotece.',
            'favorite' => $favorite->load('game.categories'),
        ], $favorite->wasRecentlyCreated ? 201 : 200);
    }

    public function update(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:wishlist,playing,completed,dropped',
        ]);

        $favorite = $request->user()
            ->favorites()
            ->where('game_id', $gameId)
            ->firstOrFail();

        $favorite->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Status gry został zmieniony.',
            'favorite' => $favorite->load('game.categories'),
        ]);
    }

    public function destroy(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $favorite = $request->user()
            ->favorites()
            ->where('game_id', $gameId)
            ->firstOrFail();

        $favorite->delete();

        return response()->json([
            'message' => 'Gra została usunięta z biblioteki.',
        ]);
    }
}

