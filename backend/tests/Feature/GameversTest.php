<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class GameversTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->assertSame('testing', app()->environment());
        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        $this->assertEmpty(config('database.connections.sqlite.url'));

        $this->assertSame(
            'sqlite',
            DB::connection()->getPdo()->getAttribute(\PDO::ATTR_DRIVER_NAME)
        );

        $this->assertSame(
            '',
            DB::selectOne('PRAGMA database_list')->file
        );

        $this->artisan('migrate', ['--force' => true])
            ->assertExitCode(0);
    }

    public function test_games_are_public(): void
    {
        $this->getJson('/api/games')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_categories_are_public(): void
    {
        $this->getJson('/api/categories')
            ->assertOk();
    }

    public function test_guest_cannot_access_library(): void
    {
        $this->getJson('/api/favorites')
            ->assertUnauthorized();
    }

    public function test_guest_cannot_access_admin(): void
    {
        $this->getJson('/api/admin/users')
            ->assertUnauthorized();
    }

    public function test_user_can_access_library(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/favorites')
            ->assertOk();
    }

    public function test_user_cannot_access_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_admin_can_access_panel(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin'
        ]);

        $this->actingAs($admin)
            ->getJson('/api/admin/users')
            ->assertOk();
    }

    public function test_admin_cannot_change_own_role(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin'
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/admin/users/{$admin->id}/role", [
                'role' => 'user'
            ])
            ->assertUnprocessable();
    }
}
