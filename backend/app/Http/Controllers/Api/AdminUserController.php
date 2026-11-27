<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    // LISTA UZYTKOWNIKOW

    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'role' => 'nullable|in:user,admin',
            'sort' => 'nullable|in:newest,oldest,name,name_desc',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = User::query()
            ->select([
                'id',
                'name',
                'email',
                'role',
                'created_at',
            ])
            ->withCount([
                'reviews',
                'favorites',
            ]);

        // WYSZUKIWANIE

        if (!empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // FILTROWANIE WEDLUG ROLI

        if (!empty($validated['role'])) {
            $query->where('role', $validated['role']);
        }

        // SORTOWANIE

        switch ($validated['sort'] ?? 'newest') {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;

            case 'name':
                $query->orderBy('name', 'asc');
                break;

            case 'name_desc':
                $query->orderBy('name', 'desc');
                break;

            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $query->orderBy('id', 'desc');

        // PAGINACJA

        return response()->json(
            $query->paginate(
                $validated['per_page'] ?? 10
            )
        );
    }

    // STATYSTYKI UZYTKOWNIKOW

    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),

            'admin_users' => User::where(
                'role', 'admin'
            )->count(),

            'regular_users' => User::where(
                'role', 'user'
            )->count(),

            'today_users' => User::whereDate(
                'created_at', today()
            )->count(),
        ]);
    }

    // SZCZEGOLY UZYTKOWNIKA

    public function show(int $userId)
    {
        $user = User::query()
            ->select([
                'id',
                'name',
                'email',
                'role',
                'created_at',
            ])
            ->withCount([
                'reviews',
                'favorites',
            ])
            ->findOrFail($userId);

        return response()->json($user);
    }

    // ZMIANA ROLI UZYTKOWNIKA

    public function updateRole(
        Request $request,
        int $userId
    ) {
        $validated = $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        $actorId = $request->user()->id;

        if ((int) $actorId === $userId) {
            return response()->json([
                'message' =>
                    'Nie możesz zmienić własnej roli.',
            ], 422);
        }

        return DB::transaction(function () use (
            $actorId,
            $userId,
            $validated
        ) {
            $users = User::query()
                ->whereIn('id', [$actorId, $userId])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $actor = $users->get($actorId);

            if (!$actor || !$actor->isAdmin()) {
                return response()->json([
                    'message' =>
                        'Brak uprawnień administratora.',
                ], 403);
            }

            $user = $users->get($userId);

            if (!$user) {
                return response()->json([
                    'message' =>
                        'Nie znaleziono użytkownika.',
                ], 404);
            }

            $user->role = $validated['role'];
            $user->save();

            return response()->json([
                'message' =>
                    'Rola użytkownika została zmieniona.',

                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ]);
        }, 3);
    }
}
