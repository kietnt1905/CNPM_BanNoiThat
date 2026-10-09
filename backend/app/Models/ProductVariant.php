<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $table = 'product_variants';

    protected $fillable = [
        'product_id',
        'sku',
        'color',
        'material',
        'length_cm',
        'width_cm',
        'height_cm',
        'weight_kg',
        'price',
        'stock_quantity',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'length_cm' => 'float',
        'width_cm' => 'float',
        'height_cm' => 'float',
        'weight_kg' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class, 'variant_id');
    }
}
