<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AdminReviewController;
use App\Http\Controllers\Api\AdminGameController;
use App\Http\Controllers\Api\AdminCategoryController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminAnalyticsController;

// PUBLICZNE ENDPOINTY

Route::get('/categories', [
    CategoryController::class, 'index'
]);

Route::get('/games', [
    GameController::class, 'index'
]);

Route::get('/games/{slug}', [
    GameController::class, 'show'
]);

Route::get('/games/{gameId}/reviews', [
    ReviewController::class, 'index'
])->whereNumber('gameId');

// ENDPOINTY ZALOGOWANYCH UZYTKOWNIKOW

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/my-reviews', [
        ReviewController::class, 'myReviews'
    ]);

    // BIBLIOTEKA

    Route::get('/favorites', [
        FavoriteController::class, 'index'
    ]);

    Route::post('/favorites/{gameId}', [
        FavoriteController::class, 'store'
    ])->whereNumber('gameId');

    Route::patch('/favorites/{gameId}', [
        FavoriteController::class, 'update'
    ])->whereNumber('gameId');

    Route::delete('/favorites/{gameId}', [
        FavoriteController::class, 'destroy'
    ])->whereNumber('gameId');

    // RECENZJE

    Route::get('/games/{gameId}/reviews/mine', [
        ReviewController::class, 'mine'
    ])->whereNumber('gameId');

    Route::post('/games/{gameId}/reviews', [
        ReviewController::class, 'store'
    ])->whereNumber('gameId');

    Route::patch('/reviews/{reviewId}', [
        ReviewController::class, 'update'
    ])->whereNumber('reviewId');

    Route::delete('/reviews/{reviewId}', [
        ReviewController::class, 'destroy'
    ])->whereNumber('reviewId');

});

// PANEL ADMINISTRATORA

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'admin'])
    ->group(function () {

        // SPRAWDZANIE UPRAWNIEN

        Route::get('/check', function (Request $request) {
            return response()->json([
                'message' => 'Dostęp administratora przyznany.',
                'role' => $request->user()->role,
            ]);
        });

        // MODERACJA RECENZJI

        Route::get('/reviews', [
            AdminReviewController::class, 'index'
        ]);

        Route::get('/reviews/stats', [
            AdminReviewController::class, 'stats'
        ]);

        Route::delete('/reviews/{reviewId}', [
            AdminReviewController::class, 'destroy'
        ])->whereNumber('reviewId');

        // ZARZADZANIE GRAMI

        Route::get('/games', [
            AdminGameController::class, 'index'
        ]);

        Route::get('/games/stats', [
            AdminGameController::class, 'stats'
        ]);

        Route::get('/games/{gameId}', [
            AdminGameController::class, 'show'
        ])->whereNumber('gameId');

        Route::post('/games', [
            AdminGameController::class, 'store'
        ]);

        Route::patch('/games/{gameId}', [
            AdminGameController::class, 'update'
        ])->whereNumber('gameId');

        Route::patch('/games/{gameId}/status', [
            AdminGameController::class, 'updateStatus'
        ])->whereNumber('gameId');

        // ZARZADZANIE KATEGORIAMI

        Route::get('/categories', [
            AdminCategoryController::class, 'index'
        ]);

        Route::get('/categories/stats', [
            AdminCategoryController::class, 'stats'
        ]);

        Route::get('/categories/{categoryId}', [
            AdminCategoryController::class, 'show'
        ])->whereNumber('categoryId');

        Route::post('/categories', [
            AdminCategoryController::class, 'store'
        ]);

        Route::patch('/categories/{categoryId}', [
            AdminCategoryController::class, 'update'
        ])->whereNumber('categoryId');

        Route::delete('/categories/{categoryId}', [
            AdminCategoryController::class, 'destroy'
        ])->whereNumber('categoryId');


        // STATYSTYKI PORTALU

        Route::get('/analytics/overview', [
            AdminAnalyticsController::class, 'overview'
        ]);

        Route::get('/analytics/activity', [
            AdminAnalyticsController::class, 'activity'
        ]);

        Route::get('/analytics/popular-games', [
            AdminAnalyticsController::class, 'popularGames'
        ]);

        Route::get('/analytics/library-statuses', [
            AdminAnalyticsController::class, 'libraryStatuses'
        ]);

        Route::get('/analytics/popular-categories', [
            AdminAnalyticsController::class, 'popularCategories'
        ]);

        Route::get('/analytics/ratings', [
            AdminAnalyticsController::class, 'ratings'
        ]);

        // ZARZADZANIE UZYTKOWNIKAMI

        Route::get('/users', [
            AdminUserController::class, 'index'
        ]);

        Route::get('/users/stats', [
            AdminUserController::class, 'stats'
        ]);

        Route::get('/users/{userId}', [
            AdminUserController::class, 'show'
        ])->whereNumber('userId');

        Route::patch('/users/{userId}/role', [
            AdminUserController::class, 'updateRole'
        ])->whereNumber('userId');

    });
