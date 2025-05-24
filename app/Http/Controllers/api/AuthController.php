<?php

namespace App\Http\Controllers\api;

use App\Class\CustomResponse;
use App\Class\Helper;
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
use App\Mail\OTPMail;
use App\Models\CauHinhChung;
use App\Models\ThietBi;
use Illuminate\Support\Facades\Hash;
use Exception;

class AuthController extends Controller
{
  public function login(AuthRequest $request)
  {
    $email = $request->input('email');

    $cauHinhChung = CauHinhChung::getAllConfig();

    $lockoutKey = 'login_lockout_' . $email;
    $attemptsKey = 'login_attempts_' . $email;

    // Kiểm tra xem tài khoản có đang bị khóa tạm thời không
    $checkLoginAttempts = $this->checkLoginAttempts($email, $lockoutKey);
    if ($checkLoginAttempts) {
      return $checkLoginAttempts;
    }

    // Kiểm tra email và mật khẩu
    $credentials = $request->only(['email', 'password']);

    if (!$token = Auth::attempt($credentials)) {
      return $this->handleLoginAttempts($attemptsKey, $lockoutKey, $cauHinhChung);
    }

    // Xóa bộ đếm đăng nhập sai khi đăng nhập thành công
    Cache::forget('login_attempts_' . $email);
    Cache::forget('login_lockout_' . $email);

    // Xử lý xác thực 2FA
    if ($cauHinhChung['XAC_THUC_2_YEU_TO'] == config('constant.XAC_THUC_2_YEU_TO.KICH_HOAT')) {
      $deviceId = $this->handle2FA($request);
      if ($deviceId) {
        return $this->handleCookie($token, $request, $deviceId);
      } else {
        return $this->send2FAOTP();
      }
    }

    return $this->handleCookie($token, $request);
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

  public function verifyOTP(Request $request)
  {
    $request->validate([
      'user_id' => 'required|string',
      'otp' => 'required|string',
    ]);

    $user_id = $request->input('user_id');
    $otp = $request->input('otp');

    $user = User::where('id', $user_id)->first();

    if (!$user) {
      return CustomResponse::error('OTP không hợp lệ', [], Response::HTTP_NOT_FOUND);
    }

    $otpCache = Cache::get('otp:user:' . $user_id);

    if (!$otpCache || (string)$otpCache !== (string)$otp) {
      return CustomResponse::error('OTP không hợp lệ hoặc đã hết hạn', [], Response::HTTP_NOT_FOUND);
    }

    $deviceId = Str::uuid();

    $thietBi = ThietBi::create([
      'user_id' => $user_id,
      'device_id' => $deviceId,
      'ip_address' => $request->ip(),
    ]);

    Cache::forget('otp:user:' . $user_id);

    $token = Auth::login($user);

    return $this->handleCookie($token, $request, $deviceId);
  }

  protected function checkLoginAttempts($email, $lockoutKey)
  {
    if (Cache::has($lockoutKey)) {
      $lockoutExpires = Cache::get($lockoutKey);
      $remainingSeconds = $lockoutExpires - time();
      if ($remainingSeconds > 0) {
        return CustomResponse::error(
          $remainingSeconds < 60
            ? 'Tài khoản đã bị tạm khóa, vui lòng thử lại sau ' . $remainingSeconds . ' giây'
            : 'Tài khoản đã bị tạm khóa, vui lòng thử lại sau ' . ceil($remainingSeconds / 60) . ' phút',
          [],
          Response::HTTP_TOO_MANY_REQUESTS
        );
      }
    }
  }

  protected function handleLoginAttempts($attemptsKey, $lockoutKey, $cauHinhChung)
  {
    // Theo dõi số lần đăng nhập sai
    $attempts = Cache::get($attemptsKey, 0) + 1;
    $maxAttempts = (int)$cauHinhChung['SO_LAN_DANG_NHAP_SAI_TOI_DA']; // Số lần đăng nhập sai tối đa cho phép

    Cache::put($attemptsKey, $attempts, now()->addMinutes((int)$cauHinhChung['THOI_GIAN_KHOA_TAI_KHOAN'])); // Lưu số lần đăng nhập sai trong 3 phút

    // Nếu đăng nhập sai quá số lần cho phép, khóa tài khoản trong 3 phút
    if ($attempts >= $maxAttempts) {
      $lockoutExpires = time() + ((int)$cauHinhChung['THOI_GIAN_KHOA_TAI_KHOAN'] * 60); // 3 phút
      Cache::put($lockoutKey, $lockoutExpires, now()->addMinutes((int)$cauHinhChung['THOI_GIAN_KHOA_TAI_KHOAN']));

      return CustomResponse::error(
        'Đăng nhập sai quá nhiều lần. Tài khoản đã bị tạm khóa trong ' . (int)$cauHinhChung['THOI_GIAN_KHOA_TAI_KHOAN'] . ' phút',
        [],
        Response::HTTP_TOO_MANY_REQUESTS
      );
    }

    return CustomResponse::error('Email hoặc mật khẩu không đúng. Bạn còn lại ' . $maxAttempts - $attempts . ' lần đăng nhập', [], Response::HTTP_UNAUTHORIZED);
  }

  protected function handleCookie($token, $request, $deviceId = null)
  {
    $user = Auth::user();
    $cauHinhChung = CauHinhChung::getAllConfig();
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

    $deviceIdCookie = Cookie::make(
      'device_id',
      $deviceId,
      (int)$cauHinhChung['THOI_HAN_XAC_THUC_LAI_THIET_BI'] * 24 * 60, // 90 ngày tính bằng phút
      '/',
      null,
      true,
      true,
      false,
      'None'
    );

    if ($deviceId) {
      return $this->respondWithToken($token)->withCookie($cookie)->withCookie($refreshCookie)->withCookie($deviceIdCookie);
    }

    return $this->respondWithToken($token)->withCookie($cookie)->withCookie($refreshCookie);
  }

  protected function handle2FA($request)
  {
    $user = Auth::user();
    $deviceId = $request->cookie('device_id') ?: "";

    $thietBi = ThietBi::where([
      'user_id' => $user->id,
      'device_id' => $deviceId,
    ])->first();

    // Chỉ kiểm tra và trả về deviceId hoặc null
    if (empty($deviceId) || !$thietBi) {
      return null;
    }

    return $deviceId;
  }

  protected function send2FAOTP()
  {
    $user = Auth::user();
    $cauHinhChung = CauHinhChung::getAllConfig();
    $otp = Helper::generateOTP();
    Cache::put('otp:user:' . $user->id, $otp, now()->addMinutes((int)$cauHinhChung['THOI_GIAN_HET_HAN_OTP']));
    Mail::to($user->email)->send(new OTPMail($otp, (int)$cauHinhChung['THOI_GIAN_HET_HAN_OTP']));

    return CustomResponse::success([
      'is_2fa' => true,
      'user_id' => $user->id,
    ], 'Gửi OTP thành công. Vui lòng kiểm tra email để nhận OTP.', Response::HTTP_OK);
  }

  protected function respondWithToken($token)
  {
    return CustomResponse::success([
      'user' => new UserResource(Auth::user()),
      'access_token' => $token,
      'token_type' => 'bearer',
      'expires_in' => Auth::factory()->getTTL() * 60,
    ], 'Đang nhập thành công', Response::HTTP_OK);
  }
}