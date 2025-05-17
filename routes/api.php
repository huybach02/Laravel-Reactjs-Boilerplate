<?php

use App\Http\Controllers\api\AuthController;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group([

  'middleware' => 'api',
  'prefix' => 'auth'

], function ($router) {

  Route::post('login', [AuthController::class, 'login'])->name('login');
  Route::post('logout', [AuthController::class, 'logout'])->name('logout');
  Route::post('refresh', [AuthController::class, 'refresh'])->name('refresh');
  Route::post('me', [AuthController::class, 'me'])->name('me');
});