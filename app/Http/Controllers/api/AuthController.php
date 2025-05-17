<?php

namespace App\Http\Controllers\api;

use App\Class\CustomResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
  public function __construct()
  {
    // $this->middleware('auth:api', ['except' => ['login']]);
  }

  public function login(AuthRequest $request)
  {
    $credentials = [
      'email' => $request->email,
      'password' => $request->password,
    ];

    if (!$token = Auth::attempt($credentials)) {
      return CustomResponse::error('Tài khoản hoặc mật khẩu không đúng', [], Response::HTTP_UNAUTHORIZED);
    }

    return $this->respondWithToken($token)->withCookie(
      'access_token',
      $token,
      60 * 24 * env('ACCESS_TOKEN_EXPIRE', 1), // 1 day
      null,
      null,
      false,
      true
    );
  }

  protected function respondWithToken($token)
  {
    return CustomResponse::success([
      'user' => Auth::user(),
      'access_token' => $token,
      'token_type' => 'bearer',
      'expires_in' => Auth::factory()->getTTL() * 60
    ], 'Đang nhập thành công', Response::HTTP_OK);
  }
}
