<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class JWT
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next): Response
  {
    try {
      if ($request->hasCookie('access_token')) {
        $token = $request->cookie('access_token');
        $request->headers->set('Authorization', 'Bearer ' . $token);
      }

      $user = JWTAuth::parseToken()->authenticate();
    } catch (TokenExpiredException $e) {
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

    return $next($request);
  }
}