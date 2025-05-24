<?php

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\CauHinhChungController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
Route::get('/auth/refresh', [AuthController::class, 'refresh'])->name('refresh');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('reset-password');
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOTP'])->name('verify-otp');

Route::group([

  'middleware' => 'jwt',

], function ($router) {

  Route::group(['prefix' => 'auth'], function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('me', [AuthController::class, 'me']);
  });

  Route::get('cau-hinh-chung', [CauHinhChungController::class, 'index']);
  Route::post('cau-hinh-chung', [CauHinhChungController::class, 'create']);
});