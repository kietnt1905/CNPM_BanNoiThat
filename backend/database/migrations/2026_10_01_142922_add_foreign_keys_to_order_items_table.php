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
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreign(['order_id'], 'fk_order_items_order')->references(['id'])->on('orders')->onUpdate('no action')->onDelete('restrict');
            $table->foreign(['variant_id'], 'fk_order_items_variant')->references(['id'])->on('product_variants')->onUpdate('no action')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign('fk_order_items_order');
            $table->dropForeign('fk_order_items_variant');
        });
    }
};
