<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    protected $fillable = [
        'order_code',
        'user_id',
        'recipient_name',
        'recipient_phone',
        'shipping_address',
        'status',
        'subtotal',
        'shipping_fee',
        'discount_amount',
        'note',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'shipping_fee' => 'float',
        'discount_amount' => 'float',
        'total_amount' => 'float',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'order_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'order_id')->latestOfMany();
    }
}
