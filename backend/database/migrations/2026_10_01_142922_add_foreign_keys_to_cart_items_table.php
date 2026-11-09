<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->foreign(['cart_id'], 'fk_cart_items_cart')->references(['id'])->on('carts')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['variant_id'], 'fk_cart_items_variant')->references(['id'])->on('product_variants')->onUpdate('no action')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropForeign('fk_cart_items_cart');
            $table->dropForeign('fk_cart_items_variant');
        });
    }
};
