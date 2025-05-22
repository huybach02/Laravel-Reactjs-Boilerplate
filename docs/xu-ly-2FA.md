# Luồng thực hiện xác thực 2FA

## Kiểm tra và xác minh đăng nhập

-   Sau khi kiểm tra thông tin đăng nhập đã chính xác
-   Tìm trong bảng `thiet_bi` xem user đó có những `device_id` nào:
    -   Nếu chưa có record nào (đăng nhập lần đầu tiên)
    -   Hoặc trường hợp đã có record mà client không gửi `device_id`/gửi `device_id` không tồn tại (đăng nhập trên thiết bị mới)
    -   => Tiến hành xử lý xác thực 2FA

## Xử lý xác thực 2FA

1. **Cache token tạm thời**

    - Cache lại token vừa tạo từ thông tin đăng nhập dưới dạng: `otpAccessTokenCache:user:[user_id] = access_token`
    - Thời gian sống (TTL): 10 phút = ttl của optCode (gán vào env hoặc lưu vào bảng `cau_hinh_chung`)

2. **Tạo và gửi OTP**

    - Tạo optCode (code 6 số) lưu vào cột tương ứng trong bảng `users`
    - Tiến hành gửi email với nội dung chứa optCode
    - Response thông báo về cho client đã gửi mail và kèm dấu hiệu để client chuyển sang trang verify OTP với userId

3. **Xử lý phía Client**
    - Client lưu userId vào localStorage
    - Ở trang verify OTP, Client submit: optCode và userId
4. **Xác minh OTP**

    - Gọi đến route POST `/otp-verify`
    - Lấy Cache đã lưu theo userId Client gửi xuống
    - Check xem Cache còn tồn tại hay không (nếu Cache còn tồn tại nghĩa là optCode còn hạn và ngược lại)
    - Truy vấn vào bảng `users` theo userId để check optCode có đúng không
    - Nếu không đúng => trả lỗi

5. **Khi xác minh OTP thành công**
    - Xoá Cache
    - Xoá cột optCode trong bảng `users`
    - Tạo `device_id` mới
    - Tạo bản ghi trong bảng `thiet_bi` với `device_id` mới tạo
    - Thực hiện logic đăng nhập

## Mã xử lý tạo token và cookie

```php
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
```

## Lưu ý quan trọng

-   Trong trường hợp xác thực 2FA thành công: trả ra `respondWithToken` kèm theo `device_id`
-   Trong trường hợp login thông thường trên thiết bị đã đăng nhập trước đó: không cần trả ra `device_id`
-   Client sẽ thực hiện lại logic đăng nhập như bình thường

### Note

// Bảng thiet_bi
Schema::create('thiet_bi', function (Blueprint $table) {
$table->id();
$table->foreignId('user_id')->constrained('users')->onDelete('cascade');
$table->string('device_id')->unique();
$table->string('user_agent')->nullable();
$table->string('ip_address', 45)->nullable();
$table->string('device_name')->nullable();
$table->timestamp('last_used_at')->nullable();
$table->timestamps();
});

// Bảng otp_codes
Schema::create('otp_codes', function (Blueprint $table) {
$table->id();
$table->foreignId('user_id')->constrained('users')->onDelete('cascade');
$table->string('otp_code');
$table->boolean('is_used')->default(false);
$table->smallInteger('attempts')->default(0);
$table->timestamp('expires_at');
$table->timestamps();
});

```php
// AuthController.php (phần xử lý login)
public function login(AuthRequest $request)
{
    // Đoạn code kiểm tra email/password giữ nguyên...

    $user = Auth::user();
    $deviceId = $request->input('device_id');

    // Kiểm tra thiết bị
    $device = $user->devices()->where('device_id', $deviceId)->first();

    if (!$device) {
        // Tạo OTP và gửi email
        $otp = $this->generateOTP();
        $expiresAt = now()->addMinutes(10);

        // Lưu OTP vào database (đã hash)
        $user->otpCodes()->create([
            'otp_code' => Hash::make($otp),
            'expires_at' => $expiresAt
        ]);

        // Cache token tạm thời
        $tempToken = JWTAuth::fromUser($user);
        Cache::put('otpAccessTokenCache:user:' . $user->id, $tempToken, 10 * 60);

        // Gửi email OTP
        Mail::to($user->email)->send(new OTPMail($otp));

        // Trả về yêu cầu xác thực 2FA
        return CustomResponse::success([
            'user_id' => $user->id,
            'requires_2fa' => true
        ], 'Vui lòng xác thực OTP đã được gửi đến email của bạn', Response::HTTP_OK);
    }

    // Thiết bị đã tin cậy, tiếp tục đăng nhập bình thường
    // Code đăng nhập bình thường giữ nguyên...
}

// Xử lý xác minh OTP
public function verifyOTP(Request $request)
{
    $request->validate([
        'user_id' => 'required|exists:users,id',
        'otp_code' => 'required|string',
        'trust_device' => 'boolean'
    ]);

    $userId = $request->input('user_id');
    $otpCode = $request->input('otp_code');

    // Kiểm tra cache token
    $cachedToken = Cache::get('otpAccessTokenCache:user:' . $userId);
    if (!$cachedToken) {
        return CustomResponse::error('OTP đã hết hạn', [], Response::HTTP_BAD_REQUEST);
    }

    // Lấy OTP code mới nhất chưa sử dụng
    $user = User::findOrFail($userId);
    $latestOTP = $user->otpCodes()
                      ->where('is_used', false)
                      ->where('expires_at', '>', now())
                      ->orderBy('created_at', 'desc')
                      ->first();

    if (!$latestOTP) {
        return CustomResponse::error('OTP không tồn tại hoặc đã hết hạn', [], Response::HTTP_BAD_REQUEST);
    }

    // Kiểm tra số lần thử
    if ($latestOTP->attempts >= 3) {
        return CustomResponse::error('Nhập sai OTP quá nhiều lần', [], Response::HTTP_TOO_MANY_REQUESTS);
    }

    // Kiểm tra OTP
    if (!Hash::check($otpCode, $latestOTP->otp_code)) {
        $latestOTP->increment('attempts');
        return CustomResponse::error('OTP không chính xác', [], Response::HTTP_BAD_REQUEST);
    }

    // OTP chính xác, đánh dấu đã sử dụng
    $latestOTP->update(['is_used' => true]);

    // Xóa cache
    Cache::forget('otpAccessTokenCache:user:' . $userId);

    // Nếu chọn tin tưởng thiết bị, lưu thông tin thiết bị
    if ($request->input('trust_device', false)) {
        $deviceId = Str::uuid()->toString();
        $user->devices()->create([
            'device_id' => $deviceId,
            'user_agent' => $request->header('User-Agent'),
            'ip_address' => $request->ip(),
            'device_name' => $this->getDeviceName($request->header('User-Agent'))
        ]);
    }

    // Tạo token và trả về
    $token = JWTAuth::fromUser($user);

    // Phần code tạo refresh token, cookies giữ nguyên...

    return $this->respondWithToken($token, $refreshToken, $user, $deviceId)->withCookie($cookie)->withCookie($refreshCookie);
}

```
