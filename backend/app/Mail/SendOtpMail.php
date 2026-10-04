<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mã xác thực tài khoản (OTP) của bạn',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'otp', // Sửa từ 'emails.otp' thành 'otp' (vì file của bạn đang là views/otp.blade.php)
        );
    }
}
