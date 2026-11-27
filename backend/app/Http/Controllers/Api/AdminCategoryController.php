<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminCategoryController extends Controller
{
    // POBIERANIE LISTY KATEGORII

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search' => 'nullable|string|max:100',
            'sort' => 'nullable|in:name,name_desc,newest,oldest,popular',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Category::withCount('games');

        // Wyszukiwanie

        if ($request->filled('search')) {
            $search = trim($request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sortowanie

        switch ($request->input('sort', 'name')) {
            case 'name_desc':
                $query->orderByDesc('name');
                break;

            case 'newest':
                $query->orderByDesc('created_at');
                break;

            case 'oldest':
                $query->orderBy('created_at');
                break;

            case 'popular':
                $query->orderByDesc('games_count');
                break;

            default:
                $query->orderBy('name');
                break;
        }

        $query->orderBy('id');

        return response()->json(
            $query->paginate(
                $request->integer('per_page', 10)
            )->withQueryString()
        );
    }

    // STATYSTYKI KATEGORII

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_categories' => Category::count(),

            'used_categories' => Category::has(
                'games'
            )->count(),

            'empty_categories' => Category::doesntHave(
                'games'
            )->count(),
        ]);
    }

    // SZCZEGOLY KATEGORII

    public function show(int $categoryId): JsonResponse
    {
        $category = Category::withCount('games')
            ->findOrFail($categoryId);

        return response()->json($category);
    }

    // DODAWANIE KATEGORII

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(
            $this->categoryRules()
        );

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Kategoria została dodana.',
            'category' => $category->loadCount('games'),
        ], 201);
    }

    // EDYTOWANIE KATEGORII

    public function update(
        Request $request,
        int $categoryId
    ): JsonResponse
    {
        $category = Category::findOrFail($categoryId);

        $validated = $request->validate(
            $this->categoryRules($category)
        );

        $category->update($validated);

        return response()->json([
            'message' => 'Kategoria została zaktualizowana.',
            'category' => $category->fresh()
                ->loadCount('games'),
        ]);
    }

    // USUWANIE KATEGORII

    public function destroy(int $categoryId): JsonResponse
    {
        return DB::transaction(function () use ($categoryId) {

            $category = Category::lockForUpdate()
                ->findOrFail($categoryId);

            if ($category->games()->exists()) {
                return response()->json([
                    'message' => 'Nie można usunąć kategorii przypisanej do gier.',
                    'games_count' => $category->games()->count(),
                ], 409);
            }

            $category->delete();

            return response()->json([
                'message' => 'Kategoria została usunięta.',
            ]);
        });
    }

    // WALIDACJA DANYCH

    private function categoryRules(
        ?Category $category = null
    ): array
    {
        $nameRule = Rule::unique('categories', 'name');
        $slugRule = Rule::unique('categories', 'slug');

        if ($category !== null) {
            $nameRule->ignore($category->id);
            $slugRule->ignore($category->id);
        }

        $required = $category === null
            ? 'required'
            : 'sometimes|required';

        return [
            'name' => [
                $required,
                'string',
                'max:100',
                $nameRule,
            ],

            'slug' => [
                $required,
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                $slugRule,
            ],

            'description' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }
}

