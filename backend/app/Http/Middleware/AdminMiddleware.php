<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(
        Request $request,
        Closure $next
    ): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Musisz się zalogować.',
            ], 401);
        }

        if (!$request->user()->isAdmin()) {
            return response()->json([
                'message' => 'Brak uprawnień administratora.',
            ], 403);
        }

        return $next($request);
    }
}

