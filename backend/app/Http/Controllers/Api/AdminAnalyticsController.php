<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Game;
use App\Models\Category;
use App\Models\Review;
use App\Models\Favorite;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    // OGOLNE STATYSTYKI PORTALU

    public function overview()
    {
        $averageRating = Review::avg('rating');

        return response()->json([
            'total_users' => User::count(),

            'total_games' => Game::count(),

            'active_games' => Game::where(
                'is_active', true
            )->count(),

            'total_categories' => Category::count(),

            'total_reviews' => Review::count(),

            'total_favorites' => Favorite::count(),

            'average_rating' => $averageRating !== null
                ? round((float) $averageRating, 1)
                : null,

            'today_users' => User::whereDate(
                'created_at', today()
            )->count(),

            'today_reviews' => Review::whereDate(
                'created_at', today()
            )->count(),
        ]);
    }

    // AKTYWNOSC W CZASIE

    public function activity(Request $request)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|in:7,14,30,90',
        ]);

        $days = (int) ($validated['days'] ?? 7);

        $startDate = today()->subDays($days - 1);
        $endDate = today()->addDay();

        $users = User::query()
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<', $endDate)
            ->selectRaw(
                'DATE(created_at) as date, COUNT(*) as total'
            )
            ->groupByRaw('DATE(created_at)')
            ->pluck('total', 'date');

        $reviews = Review::query()
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<', $endDate)
            ->selectRaw(
                'DATE(created_at) as date, COUNT(*) as total'
            )
            ->groupByRaw('DATE(created_at)')
            ->pluck('total', 'date');

        $favorites = Favorite::query()
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<', $endDate)
            ->selectRaw(
                'DATE(created_at) as date, COUNT(*) as total'
            )
            ->groupByRaw('DATE(created_at)')
            ->pluck('total', 'date');

        $activity = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate
                ->copy()
                ->addDays($i)
                ->format('Y-m-d');

            $activity[] = [
                'date' => $date,

                'users' => (int) (
                    $users[$date] ?? 0
                ),

                'reviews' => (int) (
                    $reviews[$date] ?? 0
                ),

                'favorites' => (int) (
                    $favorites[$date] ?? 0
                ),
            ];
        }

        return response()->json([
            'days' => $days,
            'activity' => $activity,
        ]);
    }

    // NAJPOPULARNIEJSZE GRY

    public function popularGames()
    {
        $games = Game::query()
            ->where('is_active', true)
            ->select([
                'id',
                'title',
                'slug',
                'thumbnail',
                'views',
            ])
            ->withCount([
                'favorites',
                'reviews',
            ])
            ->withAvg(
                'reviews as average_rating',
                'rating'
            )
            ->has('favorites')
            ->orderByDesc('favorites_count')
            ->orderByDesc('reviews_count')
            ->orderBy('id')
            ->limit(10)
            ->get();

        return response()->json($games);
    }

    // STATUSY GIER W BIBLIOTEKACH

    public function libraryStatuses()
    {
        $counts = Favorite::query()
            ->selectRaw(
                'status, COUNT(*) as total'
            )
            ->groupBy('status')
            ->pluck('total', 'status');

        $statuses = [
            'wishlist' => 'Chcę zagrać',
            'playing' => 'W trakcie',
            'completed' => 'Ukończone',
            'dropped' => 'Porzucone',
        ];

        $total = (int) $counts->sum();

        $result = [];

        foreach ($statuses as $status => $label) {
            $count = (int) (
                $counts[$status] ?? 0
            );

            $result[] = [
                'status' => $status,

                'label' => $label,

                'count' => $count,

                'percentage' => $total > 0
                    ? round($count / $total * 100, 1)
                    : 0,
            ];
        }

        return response()->json([
            'total' => $total,
            'statuses' => $result,
        ]);
    }

    // KATEGORIE WEDLUG LICZBY AKTYWNYCH GIER

    public function popularCategories()
    {
        $categories = Category::query()
            ->select([
                'id',
                'name',
                'slug',
            ])
            ->withCount([
                'games as active_games_count' =>
                    function ($query) {
                        $query->where(
                            'games.is_active',
                            true
                        );
                    },
            ])
            ->orderByDesc('active_games_count')
            ->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json($categories);
    }

    // ROZKLAD OCEN OD 1 DO 10

    public function ratings()
    {
        $counts = Review::query()
            ->selectRaw(
                'rating, COUNT(*) as total'
            )
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $result = [];

        for ($rating = 1; $rating <= 10; $rating++) {
            $result[] = [
                'rating' => $rating,

                'count' => (int) (
                    $counts[$rating] ?? 0
                ),
            ];
        }

        return response()->json([
            'total_reviews' => (int) $counts->sum(),
            'ratings' => $result,
        ]);
    }
}
