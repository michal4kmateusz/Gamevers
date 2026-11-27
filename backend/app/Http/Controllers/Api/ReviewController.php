<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    public function index(int $gameId): JsonResponse
    {
        $game = Game::where('is_active', true)
            ->findOrFail($gameId);

        $reviews = $game->reviews()
            ->with('user:id,name')
            ->latest()
            ->paginate(10);

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => $game->reviews()->avg('rating'),
            'reviews_count' => $game->reviews()->count(),
        ]);
    }


    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::where(
            'user_id',
            $request->user()->id
        )
        ->with([
            'game:id,title,slug,thumbnail,is_active'
        ])
        ->latest('updated_at')
        ->orderByDesc('id')
        ->paginate(10);

        return response()->json($reviews);
    }

    public function mine(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $game = Game::where('is_active', true)
            ->findOrFail($gameId);

        $review = Review::where('game_id', $game->id)
            ->where('user_id', $request->user()->id)
            ->with('user:id,name')
            ->first();

        return response()->json([
            'review' => $review,
        ]);
    }

    public function store(
        Request $request,
        int $gameId
    ): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:10',
            'comment' => 'nullable|string|max:2000',
        ]);

        $game = Game::where('is_active', true)
            ->findOrFail($gameId);

        $review = Review::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'game_id' => $game->id,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        if (!$review->wasRecentlyCreated) {
            return response()->json([
                'message' => 'Już oceniłeś tę grę.',
            ], 409);
        }

        return response()->json([
            'message' => 'Recenzja została dodana.',
            'review' => $review->load('user:id,name'),
        ], 201);
    }

    public function update(
        Request $request,
        int $reviewId
    ): JsonResponse
    {
        $review = Review::where(
            'user_id',
            $request->user()->id
        )->findOrFail($reviewId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:10',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Recenzja została zaktualizowana.',
            'review' => $review->load('user:id,name'),
        ]);
    }

    public function destroy(
        Request $request,
        int $reviewId
    ): JsonResponse
    {
        $review = Review::where(
            'user_id',
            $request->user()->id
        )->findOrFail($reviewId);

        $review->delete();

        return response()->json([
            'message' => 'Recenzja została usunięta.',
        ]);
    }
}


