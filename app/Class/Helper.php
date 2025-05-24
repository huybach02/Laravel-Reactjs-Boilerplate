<?php

namespace App\Class;

class Helper
{
  public static function generateOTP()
  {
    return rand(100000, 999999);
  }
}