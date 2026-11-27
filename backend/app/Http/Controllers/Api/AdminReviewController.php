<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'rating' => 'nullable|integer|min:1|max:10',
            'sort' => 'nullable|in:newest,oldest,rating_high,rating_low',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Review::with([
            'user:id,name',
            'game:id,title,slug,thumbnail,is_active',
        ]);

        if ($request->filled('search')) {
            $search = trim($validated['search']);

            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($user) use ($search) {
                        $user->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('game', function ($game) use ($search) {
                        $game->where('title', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('rating')) {
            $query->where('rating', $validated['rating']);
        }

        switch ($request->input('sort', 'newest')) {
            case 'oldest':
                $query->orderBy('created_at');
                break;

            case 'rating_high':
                $query->orderByDesc('rating');
                break;

            case 'rating_low':
                $query->orderBy('rating');
                break;

            default:
                $query->orderByDesc('created_at');
                break;
        }

        $query->orderByDesc('id');

        $reviews = $query->paginate(
            $request->integer('per_page', 10)
        )->withQueryString();

        return response()->json($reviews);
    }

    public function stats(): JsonResponse
    {
        $average = Review::avg('rating');

        return response()->json([
            'total_reviews' => Review::count(),

            'average_rating' => $average !== null
                ? round((float) $average, 1)
                : null,

            'today_reviews' => Review::whereDate(
                'created_at',
                today()
            )->count(),
        ]);
    }

    public function destroy(int $reviewId): JsonResponse
    {
        $review = Review::findOrFail($reviewId);

        $review->delete();

        return response()->json([
            'message' => 'Recenzja została usunięta przez administratora.',
        ]);
    }
}

