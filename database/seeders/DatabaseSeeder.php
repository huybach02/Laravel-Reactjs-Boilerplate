<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'phone' => '1234567890',
            'province_id' => '01',
            'district_id' => '01',
            'ward_id' => '01',
            'address' => '123 Admin St',
            'birthday' => '2000-01-01',
            'image' => 'admin.jpg',
            'description' => 'Administrator',
            'password' => bcrypt('password'),
        ]);
    }
}