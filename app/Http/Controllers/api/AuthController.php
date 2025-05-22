<?php

namespace App\Http\Controllers\api;

use App\Class\CustomResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ForgotPasswordMail;
use Illuminate\Support\Facades\Hash;
use Exception;

class AuthController extends Controller
{
  public function login(AuthRequest $request)
  {
    $email = $request->input('email');

    // Kiểm tra xem tài khoản có đang bị khóa tạm thời không
    $lockoutKey = 'login_lockout_' . $email;
    if (Cache::has($lockoutKey)) {
      $lockoutExpires = Cache::get($lockoutKey);
      $remainingSeconds = $lockoutExpires - time();
      if ($remainingSeconds > 0) {
        return CustomResponse::error(
          'Tài khoản đã bị tạm khóa, vui lòng thử lại sau ' . ceil($remainingSeconds / 60) . ' phút',
          [],
          Response::HTTP_TOO_MANY_REQUESTS
        );
      }
    }

    // Kiểm tra email và mật khẩu
    $credentials = $request->only(['email', 'password']);

    if (!$token = Auth::attempt($credentials)) {
      // Theo dõi số lần đăng nhập sai
      $attemptsKey = 'login_attempts_' . $email;
      $attempts = Cache::get($attemptsKey, 0) + 1;
      $maxAttempts = (int)env('MAX_LOGIN_ATTEMPTS', 5); // Số lần đăng nhập sai tối đa cho phép

      Cache::put($attemptsKey, $attempts, now()->addMinutes((int)env('LOCKOUT_TIME', 3))); // Lưu số lần đăng nhập sai trong 3 phút

      // Nếu đăng nhập sai quá số lần cho phép, khóa tài khoản trong 3 phút
      if ($attempts >= $maxAttempts) {
        $lockoutExpires = time() + ((int)env('LOCKOUT_TIME', 3) * 60); // 3 phút
        Cache::put($lockoutKey, $lockoutExpires, now()->addMinutes((int)env('LOCKOUT_TIME', 3)));

        return CustomResponse::error(
          'Đăng nhập sai quá nhiều lần. Tài khoản đã bị tạm khóa trong 3 phút',
          [],
          Response::HTTP_TOO_MANY_REQUESTS
        );
      }

      return CustomResponse::error('Email hoặc mật khẩu không đúng. Bạn còn lại ' . $maxAttempts - $attempts . ' lần đăng nhập', [], Response::HTTP_UNAUTHORIZED);
    }

    // Xóa bộ đếm đăng nhập sai khi đăng nhập thành công
    Cache::forget('login_attempts_' . $email);
    Cache::forget('login_lockout_' . $email);

    $user = Auth::user();

    // TODO: Xử lý xác thực 2FA

    $refreshTokenData = [
      'user_id' => $user->id,
      'expired_at' => time() + (int)config('jwt.refresh_ttl') * 60 * ($request->input('remember_me') ? 2 : 1) // 1209600 giây = 2 tuần
    ];

    $refreshToken = JWTAuth::getJWTProvider()->encode($refreshTokenData);

    // Tạo cookie cho access token
    $cookie = Cookie::make(
      'access_token',
      $token,
      Auth::factory()->getTTL() * 60 * 24, // 1 day
      '/',
      null,
      true,
      true,
      false,
      'None'
    );

    // Tạo cookie cho refresh token
    $refreshCookie = Cookie::make(
      'refresh_token',
      $refreshToken,
      config('jwt.refresh_ttl') * ($request->input('remember_me') ? 2 : 1) + 24, // > 2 weeks 
      '/',
      null,
      true,
      true,
      false,
      'None'
    );

    return $this->respondWithToken($token, $refreshToken, $user)->withCookie($cookie)->withCookie($refreshCookie);
  }

  public function me()
  {
    return CustomResponse::success([
      'user' => new UserResource(Auth::user()),
    ], 'Lấy thông tin người dùng thành công', Response::HTTP_OK);
  }

  public function logout()
  {
    Auth::logout();

    return CustomResponse::success([], 'Đăng xuất thành công', Response::HTTP_OK);
  }

  public function refresh(Request $request)
  {
    try {
      // Trường hợp 1: access token còn hạn
      if ($request->hasCookie('access_token')) {
        $token = $request->cookie('access_token');
        $request->headers->set('Authorization', 'Bearer ' . $token);
      }

      $user = JWTAuth::parseToken()->authenticate();

      // Xử lý refresh token (dùng Auth::refresh)
      if ($request->hasCookie('refresh_token')) {
        return $this->handleRefreshToken($request, false);
      }
    } catch (TokenExpiredException $e) {
      // Trường hợp 2: access token hết hạn, dùng Auth::login
      if ($request->hasCookie('refresh_token')) {
        return $this->handleRefreshToken($request, true);
      }

      return response()->json([
        'error' => 'Token đã hết hạn',
        'error_code' => 'TOKEN_EXPIRED'
      ], Response::HTTP_UNAUTHORIZED);
    } catch (TokenInvalidException $e) {
      return response()->json([
        'error' => 'Token không hợp lệ',
        'error_code' => 'INVALID_TOKEN'
      ], Response::HTTP_UNAUTHORIZED);
    } catch (JWTException $e) {
      return response()->json([
        'error' => 'Token không tồn tại',
        'error_code' => 'TOKEN_NOT_FOUND'
      ], Response::HTTP_UNAUTHORIZED);
    }
  }

  public function forgotPassword(Request $request)
  {
    try {
      $email = $request->input('email');

      $user = User::where('email', $email)->first();

      if (!$user) {
        return CustomResponse::error('Email không tồn tại', [], Response::HTTP_NOT_FOUND);
      }

      $token = Str::random(60);

      DB::table('password_reset_tokens')->updateOrInsert([
        'email' => $email,
      ], [
        'token' => $token,
        'created_at' => now()
      ]);

      $url = env('FRONTEND_URL') . '/admin/reset-password?token=' . $token;

      $data = [
        'name' => $user->name,
        'url' => $url
      ];

      Mail::to($email)->send(new ForgotPasswordMail($data));

      return CustomResponse::success([], 'Gửi yêu cầu khôi phục mật khẩu thành công', Response::HTTP_OK);
    } catch (Exception $e) {
      return CustomResponse::error('Gửi yêu cầu khôi phục mật khẩu thất bại', [], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  public function resetPassword(Request $request)
  {
    $token = $request->input('token');
    $password = $request->input('password');

    $tokenData = DB::table('password_reset_tokens')->where('token', $token)->first();

    if (!$tokenData) {
      return CustomResponse::error('Token không tồn tại', [], Response::HTTP_NOT_FOUND);
    }

    $user = User::where('email', $tokenData->email)->first();

    if (!$user) {
      return CustomResponse::error('Email không tồn tại', [], Response::HTTP_NOT_FOUND);
    }

    $user->password = Hash::make($password);
    $user->save();

    DB::table('password_reset_tokens')->where('token', $token)->delete();

    return CustomResponse::success([], 'Đổi mật khẩu thành công', Response::HTTP_OK);
  }

  protected function handleRefreshToken(Request $request, $loginInsteadOfRefresh = false)
  {
    $refreshToken = $request->cookie('refresh_token');
    $refreshTokenData = JWTAuth::getJWTProvider()->decode($refreshToken);

    if (time() > $refreshTokenData['expired_at']) {
      return response()->json([
        'error' => 'Refresh token đã hết hạn',
        'error_code' => 'REFRESH_TOKEN_EXPIRED'
      ], Response::HTTP_UNAUTHORIZED);
    }

    $userId = $refreshTokenData['user_id'];
    $user = User::find($userId);

    if (!$user) {
      return response()->json([
        'error' => 'Không tìm thấy người dùng',
        'error_code' => 'USER_NOT_FOUND'
      ], Response::HTTP_NOT_FOUND);
    }

    if ($loginInsteadOfRefresh) {
      $newToken = Auth::login($user);
    } else {
      $newToken = Auth::refresh();
      Auth::invalidate(true);
    }

    $cookie = Cookie::make(
      'access_token',
      $newToken,
      Auth::factory()->getTTL() * 60 * 24, // 1 day
      '/',
      null,
      true,
      true,
      false,
      'None'
    );

    return $this->respondWithToken($newToken)->withCookie($cookie);
  }

  protected function respondWithToken($token)
  {
    return CustomResponse::success([
      'user' => new UserResource(Auth::user()),
      'access_token' => $token,
      'token_type' => 'bearer',
      'expires_in' => Auth::factory()->getTTL() * 60
    ], 'Đang nhập thành công', Response::HTTP_OK);
  }
}