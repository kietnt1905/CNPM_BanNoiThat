<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VNPay Sandbox Configuration
    |--------------------------------------------------------------------------
    |
    | Các thông số kết nối cổng thanh toán VNPay được cấp bởi VNPAY Sandbox
    |
    */

    'tmn_code' => env('VNPAY_TMN_CODE', '7J0Z11SC'),
    'hash_secret' => env('VNPAY_HASH_SECRET', 'WUZHELPNENQDABOFEKVTRIBZFJIIPULA'),
    'url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'return_url' => env('VNPAY_RETURN_URL', 'http://localhost:5173/thanh-toan/vnpay-return'),
    'version' => '2.1.0',
    'command' => 'pay',
    'currency' => 'VND',
    'locale' => 'vn',

    /*
    |--------------------------------------------------------------------------
    | Thông tin Thẻ Test NCB Sandbox (Tiện ích tham khảo cho Dev/QA)
    |--------------------------------------------------------------------------
    */
    'test_card' => [
        'bank' => 'NCB',
        'card_number' => '9704198526191432198',
        'card_holder' => 'NGUYEN VAN A',
        'issue_date' => '07/15',
        'otp' => '123456',
    ],
];
