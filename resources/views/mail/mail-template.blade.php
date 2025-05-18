<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>

<body>
    <h1>Forgot Password</h1>
    <p>Hello {{ $data['name'] }}</p>
    <p>Please click the link below to reset your password</p>
    <a href="{{ $data['url'] }}">Reset Password</a>
</body>

</html>
